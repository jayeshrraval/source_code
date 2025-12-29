// ✅ રિક્વેસ્ટ સ્વીકારવાનું લોજિક (PrivateChatScreen સાથે જોડાયેલું)
  const handleAccept = async (requestId: number, senderId: string) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) return;

        // ૧. રિક્વેસ્ટ ટેબલમાં સ્ટેટસ અપડેટ કરો
        const { error: updateError } = await supabase
            .from('requests')
            .update({ status: 'accepted' })
            .eq('id', requestId);

        if (updateError) throw updateError;

        // ૨. ચેક કરો કે રૂમ પહેલેથી છે કે નહીં
        const { data: existingRoom } = await supabase
            .from('chat_rooms')
            .select('id')
            .contains('participant_ids', [user.id, senderId])
            .eq('type', 'matrimony')
            .maybeSingle();

        // ૩. જો રૂમ ના હોય તો જ નવો બનાવો (PrivateChatScreen માટે જરૂરી)
        if (!existingRoom) {
            const { error: roomError } = await supabase
                .from('chat_rooms')
                .insert([{
                    type: 'matrimony',
                    participant_ids: [user.id, senderId] 
                }]);
            
            if (roomError) console.error('Chat Room Creation Error:', roomError);
        }

        alert("રિક્વેસ્ટ સ્વીકારાઈ ગઈ! હવે તમે ચેટ કરી શકો છો.");
        fetchRequests(); 

    } catch (error) {
        console.error(error);
        alert("રિક્વેસ્ટ સ્વીકારવામાં તકલીફ થઈ છે.");
    }
  };

  // 💬 ચેટ શરૂ કરવાનું લોજિક (સીધું PrivateChatScreen પર મોકલશે)
  const handleStartChat = async (otherId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if(!user) return;

    // ૧. બંને વચ્ચેનો રૂમ શોધો
    const { data: room } = await supabase
        .from('chat_rooms')
        .select('id')
        .contains('participant_ids', [user.id, otherId])
        .eq('type', 'matrimony')
        .maybeSingle();

    if (room) {
        // ૨. તમારી PrivateChatScreen.tsx ના '/private-chat/:roomId' રૂટ પર મોકલો
        navigate(`/private-chat/${room.id}`); 
    } else {
        // ૩. જો રૂમ ના મળે તો એરર બતાવો અથવા નવો બનાવીને મોકલો
        alert("ચેટ કનેક્શન મળી રહ્યું નથી. મહેરબાની કરીને ફરી પ્રયાસ કરો.");
    }
  };