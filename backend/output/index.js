var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.ts
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Encrypted-Yw-ID, X-Is-Login"
};
var src_default = {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    const url = new URL(request.url);
    const path = url.pathname;
    try {
      const encryptedYwId = request.headers.get("X-Encrypted-Yw-ID") || "anonymous";
      if (path === "/api/families" && request.method === "POST") {
        return await createFamily(request, env, encryptedYwId);
      }
      if (path === "/api/families" && request.method === "GET") {
        return await getFamilies(request, env);
      }
      if (path.match(/^\/api\/families\/\d+$/) && request.method === "GET") {
        const id = path.split("/").pop();
        return await getFamilyById(env, parseInt(id));
      }
      if (path === "/api/families/search" && request.method === "GET") {
        return await searchFamilies(request, env);
      }
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("API Error:", error);
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
  }
};
async function createFamily(request, env, encryptedYwId) {
  const data = await request.json();
  if (!data.head_name || !data.sub_surname || !data.gol) {
    return new Response(
      JSON.stringify({ error: "\u0AAE\u0ACB\u0AAD\u0AC0\u0AA8\u0AC1\u0A82 \u0AA8\u0ABE\u0AAE, \u0AAA\u0AC7\u0A9F\u0ABE \u0A85\u0A9F\u0A95 \u0A85\u0AA8\u0AC7 \u0A97\u0ACB\u0AB3 \u0A9C\u0AB0\u0AC2\u0AB0\u0AC0 \u0A9B\u0AC7" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
  if (!data.members || data.members.length === 0) {
    return new Response(
      JSON.stringify({ error: "\u0A93\u0A9B\u0ABE\u0AAE\u0ABE\u0A82 \u0A93\u0A9B\u0ACB \u0A8F\u0A95 \u0AB8\u0AAD\u0ACD\u0AAF \u0A89\u0AAE\u0AC7\u0AB0\u0ACB" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
  const familyStmt = env.DB.prepare(`
    INSERT INTO families (head_name, sub_surname, gol, village, taluko, district, current_residence, encrypted_yw_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const familyResult = await familyStmt.bind(
    data.head_name,
    data.sub_surname,
    data.gol,
    data.village || null,
    data.taluko || null,
    data.district || null,
    data.current_residence || null,
    encryptedYwId
  ).run();
  const familyId = familyResult.meta.last_row_id;
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
      message: "\u0AAA\u0AB0\u0ABF\u0AB5\u0ABE\u0AB0 \u0AB8\u0AAB\u0AB3\u0AA4\u0ABE\u0AAA\u0AC2\u0AB0\u0ACD\u0AB5\u0A95 \u0AB0\u0A9C\u0AC0\u0AB8\u0ACD\u0A9F\u0AB0 \u0AA5\u0AAF\u0ACB",
      family_id: familyId
    }),
    {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
}
__name(createFamily, "createFamily");
async function getFamilies(request, env) {
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const { results } = await env.DB.prepare(`
    SELECT * FROM families ORDER BY created_at DESC LIMIT ? OFFSET ?
  `).bind(limit, offset).all();
  const familiesWithMembers = await Promise.all(
    results.map(async (family) => {
      const { results: members } = await env.DB.prepare(`
        SELECT * FROM family_members WHERE family_id = ?
      `).bind(family.id).all();
      return { ...family, members };
    })
  );
  return new Response(JSON.stringify({ families: familiesWithMembers }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
__name(getFamilies, "getFamilies");
async function getFamilyById(env, id) {
  const { results: familyResults } = await env.DB.prepare(`
    SELECT * FROM families WHERE id = ?
  `).bind(id).all();
  if (familyResults.length === 0) {
    return new Response(JSON.stringify({ error: "\u0AAA\u0AB0\u0ABF\u0AB5\u0ABE\u0AB0 \u0AAE\u0AB3\u0ACD\u0AAF\u0ACB \u0AA8\u0AA5\u0AC0" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  const family = familyResults[0];
  const { results: members } = await env.DB.prepare(`
    SELECT * FROM family_members WHERE family_id = ?
  `).bind(id).all();
  return new Response(JSON.stringify({ ...family, members }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
__name(getFamilyById, "getFamilyById");
async function searchFamilies(request, env) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";
  const village = url.searchParams.get("village") || "";
  const subSurname = url.searchParams.get("sub_surname") || "";
  const gol = url.searchParams.get("gol") || "";
  let sql = "SELECT * FROM families WHERE 1=1";
  const params = [];
  if (query) {
    sql += " AND (head_name LIKE ? OR village LIKE ? OR sub_surname LIKE ? OR gol LIKE ?)";
    const searchTerm = `%${query}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }
  if (village) {
    sql += " AND village LIKE ?";
    params.push(`%${village}%`);
  }
  if (subSurname) {
    sql += " AND sub_surname LIKE ?";
    params.push(`%${subSurname}%`);
  }
  if (gol) {
    sql += " AND gol LIKE ?";
    params.push(`%${gol}%`);
  }
  sql += " ORDER BY created_at DESC LIMIT 50";
  const stmt = env.DB.prepare(sql);
  const { results } = await (params.length > 0 ? stmt.bind(...params) : stmt).all();
  const familiesWithMembers = await Promise.all(
    results.map(async (family) => {
      const { results: members } = await env.DB.prepare(`
        SELECT * FROM family_members WHERE family_id = ?
      `).bind(family.id).all();
      return { ...family, members };
    })
  );
  return new Response(JSON.stringify({ families: familiesWithMembers }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
__name(searchFamilies, "searchFamilies");
export {
  src_default as default
};
//# sourceMappingURL=index.js.map
