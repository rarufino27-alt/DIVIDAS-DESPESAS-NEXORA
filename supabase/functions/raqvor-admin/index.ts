import { withSupabase } from 'npm:@supabase/server'

const cors={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS',
}

export default withSupabase({auth:'user'}, async (req,ctx)=>{
  if(req.method==='OPTIONS') return new Response('ok',{headers:cors})
  if(req.method!=='POST') return Response.json({error:'Method not allowed'},{status:405,headers:cors})
  const caller=ctx.userClaims?.sub
  if(!caller) return Response.json({error:'Não autenticado'},{status:401,headers:cors})
  const admin=await ctx.supabase.from('admin_users').select('role,active').eq('user_id',caller).maybeSingle()
  if(admin.error) return Response.json({error:admin.error.message},{status:500,headers:cors})
  if(!admin.data?.active) return Response.json({error:'Sem permissão administrativa.'},{status:403,headers:cors})

  const body=await req.json().catch(()=>({}))
  const userId=String(body.user_id||'')
  const action=String(body.action||'')
  if(!userId) return Response.json({error:'user_id obrigatório'},{status:400,headers:cors})

  if(action==='update_auth'){
    const attrs:any={}
    if(body.email) attrs.email=String(body.email).trim().toLowerCase()
    if(body.phone) attrs.phone=String(body.phone).trim()
    if(body.password) attrs.password=String(body.password)
    if(body.email_confirm===true) attrs.email_confirm=true
    if(body.phone_confirm===true) attrs.phone_confirm=true
    if(body.full_name!==undefined) attrs.user_metadata={full_name:String(body.full_name)}
    if(!Object.keys(attrs).length) return Response.json({error:'Nenhuma alteração enviada'},{status:400,headers:cors})
    const r=await ctx.supabaseAdmin.auth.admin.updateUserById(userId,attrs)
    if(r.error) return Response.json({error:r.error.message},{status:400,headers:cors})
    await ctx.supabase.from('admin_audit_log').insert({admin_user_id:caller,action:'auth_user_updated',target_user_id:userId,metadata:{fields:Object.keys(attrs)}})
    return Response.json({ok:true,user:r.data.user},{headers:cors})
  }

  if(action==='ban_auth'){
    const duration=body.banned===true?'876000h':'none'
    const r=await ctx.supabaseAdmin.auth.admin.updateUserById(userId,{ban_duration:duration})
    if(r.error) return Response.json({error:r.error.message},{status:400,headers:cors})
    await ctx.supabase.from('admin_audit_log').insert({admin_user_id:caller,action:body.banned===true?'auth_user_banned':'auth_user_unbanned',target_user_id:userId,metadata:{ban_duration:duration}})
    return Response.json({ok:true},{headers:cors})
  }

  return Response.json({error:'Ação não suportada'},{status:400,headers:cors})
})
