/**
 * Yogi Samaj Sambandh Backend Worker
 * Handles family registration and search APIs
 */

interface Env {
  DB: D1Database;
}

interface FamilyMember {
  member_name: string;
  relationship: string;
  gender: string;
}

interface FamilyData {
  head_name: string;
  sub_surname: string;
  gol: string;
  village?: string;
  taluko?: string;
  district?: string;
  current_residence?: string;
  members: FamilyMember[];
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Encrypted-Yw-ID, X-Is-Login',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Get user ID from header
      const encryptedYwId = request.headers.get('X-Encrypted-Yw-ID') || 'anonymous';

      // API Routes
      if (path === '/api/families' && request.method === 'POST') {
        return await createFamily(request, env, encryptedYwId);
      }

      if (path === '/api/families' && request.method === 'GET') {
        return await getFamilies(request, env);
      }

      if (path.match(/^\/api\/families\/\d+$/) && request.method === 'GET') {
        const id = path.split('/').pop();
        return await getFamilyById(env, parseInt(id!));
      }

      if (path === '/api/families/search' && request.method === 'GET') {
        return await searchFamilies(request, env);
      }

      // 404 for unknown routes
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('API Error:', error);
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  },
};

// Create a new family registration
async function createFamily(request: Request, env: Env, encryptedYwId: string): Promise<Response> {
  const data: FamilyData = await request.json();

  // Validation
  if (!data.head_name || !data.sub_surname || !data.gol) {
    return new Response(
      JSON.stringify({ error: 'મોભીનું નામ, પેટા અટક અને ગોળ જરૂરી છે' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  if (!data.members || data.members.length === 0) {
    return new Response(
      JSON.stringify({ error: 'ઓછામાં ઓછો એક સભ્ય ઉમેરો' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Insert family
  const familyStmt = env.DB.prepare(`
    INSERT INTO families (head_name, sub_surname, gol, village, taluko, district, current_residence, encrypted_yw_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const familyResult = await familyStmt
    .bind(
      data.head_name,
      data.sub_surname,
      data.gol,
      data.village || null,
      data.taluko || null,
      data.district || null,
      data.current_residence || null,
      encryptedYwId
    )
    .run();

  const familyId = familyResult.meta.last_row_id;

  // Insert family members
  for (const member of data.members) {
    const memberStmt = env.DB.prepare(`
      INSERT INTO family_members (family_id, member_name, relationship, gender)
      VALUES (?, ?, ?, ?)
    `);
    await memberStmt.bind(familyId, member.member_name, member.relationship, member.gender).run();
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: 'પરિવાર સફળતાપૂર્વક રજીસ્ટર થયો',
      family_id: familyId,
    }),
    {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

// Get all families with pagination
async function getFamilies(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  const { results } = await env.DB.prepare(`
    SELECT * FROM families ORDER BY created_at DESC LIMIT ? OFFSET ?
  `)
    .bind(limit, offset)
    .all();

  // Get members for each family
  const familiesWithMembers = await Promise.all(
    results.map(async (family: any) => {
      const { results: members } = await env.DB.prepare(`
        SELECT * FROM family_members WHERE family_id = ?
      `)
        .bind(family.id)
        .all();
      return { ...family, members };
    })
  );

  return new Response(JSON.stringify({ families: familiesWithMembers }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Get family by ID
async function getFamilyById(env: Env, id: number): Promise<Response> {
  const { results: familyResults } = await env.DB.prepare(`
    SELECT * FROM families WHERE id = ?
  `)
    .bind(id)
    .all();

  if (familyResults.length === 0) {
    return new Response(JSON.stringify({ error: 'પરિવાર મળ્યો નથી' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const family = familyResults[0];
  const { results: members } = await env.DB.prepare(`
    SELECT * FROM family_members WHERE family_id = ?
  `)
    .bind(id)
    .all();

  return new Response(JSON.stringify({ ...family, members }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Search families
async function searchFamilies(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';
  const village = url.searchParams.get('village') || '';
  const subSurname = url.searchParams.get('sub_surname') || '';
  const gol = url.searchParams.get('gol') || '';

  let sql = 'SELECT * FROM families WHERE 1=1';
  const params: string[] = [];

  if (query) {
    sql += ' AND (head_name LIKE ? OR village LIKE ? OR sub_surname LIKE ? OR gol LIKE ?)';
    const searchTerm = `%${query}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (village) {
    sql += ' AND village LIKE ?';
    params.push(`%${village}%`);
  }

  if (subSurname) {
    sql += ' AND sub_surname LIKE ?';
    params.push(`%${subSurname}%`);
  }

  if (gol) {
    sql += ' AND gol LIKE ?';
    params.push(`%${gol}%`);
  }

  sql += ' ORDER BY created_at DESC LIMIT 50';

  const stmt = env.DB.prepare(sql);
  const { results } = await (params.length > 0 ? stmt.bind(...params) : stmt).all();

  // Get members for each family
  const familiesWithMembers = await Promise.all(
    results.map(async (family: any) => {
      const { results: members } = await env.DB.prepare(`
        SELECT * FROM family_members WHERE family_id = ?
      `)
        .bind(family.id)
        .all();
      return { ...family, members };
    })
  );

  return new Response(JSON.stringify({ families: familiesWithMembers }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
