
const state={page:localStorage.getItem('raflo_page')||'dashboard',dark:localStorage.getItem('raflo_dark')==='1',
moves:JSON.parse(localStorage.getItem('raflo_moves')||'[]'),
debts:JSON.parse(localStorage.getItem('raflo_debts')||'[]'),
receipts:JSON.parse(localStorage.getItem('raflo_receipts')||'[]'),
cards:JSON.parse(localStorage.getItem('raflo_cards')||'[]')};
const $=id=>document.getElementById(id), brl=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(+v||0);
const pages=[
 ['dashboard','⌂','Dashboard'],['cash','▣','Livro Caixa'],['debts','◇','Dívidas e Despesas'],
 ['receipts','↗','Receitas'],['planning','◫','Planejamento'],['calendar','▦','Calendário Financeiro'],
 ['reports','▥','Relatórios'],['settings','⚙','Configurações']];
$('nav').innerHTML=pages.map(p=>`<button data-page="${p[0]}"><i>${p[1]}</i>${p[2]}</button>`).join('');
document.querySelectorAll('#nav button').forEach(b=>b.onclick=()=>go(b.dataset.page));
function go(p){state.page=p;localStorage.setItem('raflo_page',p);closeMenu();render()}
function openMenu(){$('drawer').classList.add('open');$('shade').classList.add('open')}
function closeMenu(){$('drawer').classList.remove('open');$('shade').classList.remove('open')}
function toggleTheme(){state.dark=!state.dark;localStorage.setItem('raflo_dark',state.dark?'1':'0');render()}
function persist(){for(const [k,v] of Object.entries({raflo_moves:state.moves,raflo_debts:state.debts,raflo_receipts:state.receipts,raflo_cards:state.cards}))localStorage.setItem(k,JSON.stringify(v))}
function head(t,s){return `<div class="ey">RAFLO FINANCE</div><div class="title">${t}</div><div class="sub">${s}</div>`}
function totals(){let i=state.moves.filter(x=>x.type==='in').reduce((a,x)=>a+x.value,0),o=state.moves.filter(x=>x.type==='out').reduce((a,x)=>a+x.value,0);return{i,o,bal:i-o}}
function dashboard(){
 let t=totals(), pending=state.debts.filter(x=>x.status!=='pago').reduce((a,x)=>a+x.value,0);
 return head('Dashboard','Visão semanal e mensal, com o essencial em primeiro lugar.')+
 `<div class="hero"><div><small>SALDO ATUAL DISPONÍVEL</small><div class="big">${brl(t.bal)}</div><p>Entradas recebidas − saídas pagas</p></div><div><small>SALDO PROJETADO</small><div class="big">${brl(t.bal-pending)}</div><p>Considerando compromissos em aberto</p></div><div><small>DIÁRIA NECESSÁRIA</small><div class="big">${brl(Math.max(pending/20,0))}</div><p>Estimativa para o ciclo atual</p></div></div>
 <div class="grid">
 <div class="card metric"><div class="label">Receitas recebidas</div><div class="value green">${brl(t.i)}</div></div>
 <div class="card metric"><div class="label">Despesas pagas</div><div class="value red">${brl(t.o)}</div></div>
 <div class="card metric"><div class="label">A pagar</div><div class="value red">${brl(pending)}</div></div>
 <div class="card metric"><div class="label">A receber</div><div class="value green">${brl(0)}</div></div>
 <div class="card metric"><div class="label">Dívidas + empréstimos</div><div class="value red">${brl(pending)}</div></div>
 <div class="card metric"><div class="label">Cartões de crédito</div><div class="value">${state.cards.length}</div></div>
 <div class="card metric"><div class="label">Resultado do mês</div><div class="value ${t.bal>=0?'green':'red'}">${brl(t.bal)}</div></div>
 <div class="card metric"><div class="label">Lançamentos</div><div class="value">${state.moves.length}</div></div></div>
 <div class="section card"><div class="row"><div><h2>Semana atual</h2><div class="muted">Receitas, pagamentos e saldo da semana.</div></div><button class="btn light" onclick="go('calendar')">Ver calendário</button></div><div class="bar"><span style="width:${Math.min(100,Math.max(4,t.i/(pending+t.i||1)*100))}%"></span></div></div>`;
}
function cash(){
 let t=totals();
 return head('Livro Caixa','Abra o dia, registre tudo que entra e sai e feche com o saldo positivo ou negativo.')+
 `<div class="card"><div class="row"><div><div class="ey">LIVRO CAIXA DIÁRIO</div><h2>${new Date().toLocaleDateString('pt-BR')}</h2></div><span class="pill green">CAIXA ABERTO</span></div><div class="grid"><div class="metric"><div class="label">Saldo de abertura</div><div class="value">${brl(0)}</div></div><div class="metric"><div class="label">Entradas</div><div class="value green">${brl(t.i)}</div></div><div class="metric"><div class="label">Saídas</div><div class="value red">${brl(t.o)}</div></div><div class="metric"><div class="label">Saldo líquido</div><div class="value ${t.bal>=0?'green':'red'}">${brl(t.bal)}</div></div></div></div>
 <div class="section card"><div class="ey">CAIXA ABERTO</div><h2>Registrar movimento</h2><div class="muted" style="margin-bottom:9px">Entrada ou saída. Informe origem/destino e a natureza do movimento.</div>
 <form class="form" onsubmit="addMove(event)"><div class="field"><label>Movimento</label><select id="mt"><option value="in">Entrada</option><option value="out">Saída</option></select></div><div class="field"><label>Valor</label><input id="mv" type="number" step=".01" min="0" required></div><div class="field"><label>Descrição</label><input id="md" required placeholder="Ex.: corrida, mercado, parcela"></div><div class="field"><label>Origem / destino</label><input id="ms" placeholder="Pessoa, empresa, banco..."></div><div class="field"><label>Natureza</label><select id="mn"><option>Movimento normal</option><option>Empréstimo</option><option>Compra no cartão</option><option>Devolução</option></select></div><div class="field"><label>Precisa devolver?</label><select id="mr"><option>Não</option><option>Sim</option></select></div><div class="field full"><button class="btn">Registrar movimento</button></div></form></div>
 <div class="section card"><div class="row"><h2>Movimentos do dia</h2><button class="btn light" onclick="closeCash()">Fechar caixa</button></div><div class="list">${state.moves.length?state.moves.slice().reverse().map(x=>`<div class="item"><span class="pill ${x.type==='in'?'green':'red'}">${x.type==='in'?'ENTRADA':'SAÍDA'}</span><span><b>${x.description}</b><small>${x.source||'—'} • ${x.nature||'Movimento normal'}</small></span><strong class="${x.type==='in'?'green':'red'}">${brl(x.value)}</strong></div>`).join(''):'<div class="empty">Nenhum movimento registrado hoje.</div>'}</div></div>`;
}
function addMove(e){e.preventDefault();state.moves.push({type:mt.value,value:+mv.value,description:md.value,source:ms.value,nature:mn.value,returnable:mr.value,date:new Date().toISOString()});persist();render()}
function closeCash(){alert('Caixa fechado. O saldo líquido do dia será lançado como receita do dia na versão integrada ao Supabase.')}
function debts(){
 let activeTab=localStorage.getItem('raflo_debt_tab')||'todos';
 return head('Dívidas e Despesas','Uma única área para compromissos, credores, empréstimos e cartões, sem misturar a visualização.')+
 `<div class="tabs"><button class="tab ${activeTab==='todos'?'active':''}" onclick="debtTab('todos')">Todos</button><button class="tab ${activeTab==='cartoes'?'active':''}" onclick="debtTab('cartoes')">Cartões</button><button class="tab ${activeTab==='emprestimos'?'active':''}" onclick="debtTab('emprestimos')">Empréstimos</button><button class="tab ${activeTab==='recorrentes'?'active':''}" onclick="debtTab('recorrentes')">Recorrentes</button></div>
 <div class="grid"><div class="card metric"><div class="label">Em aberto</div><div class="value red">${brl(state.debts.filter(x=>x.status!=='pago').reduce((a,x)=>a+x.value,0))}</div></div><div class="card metric"><div class="label">Atrasado</div><div class="value amber">${brl(state.debts.filter(x=>x.status==='atrasado').reduce((a,x)=>a+x.value,0))}</div></div><div class="card metric"><div class="label">Cartões</div><div class="value">${state.cards.length}</div></div><div class="card metric"><div class="label">Recorrentes</div><div class="value">${state.debts.filter(x=>x.recurring).length}</div></div></div>
 <div class="section card"><h2>Novo compromisso</h2><form class="form" onsubmit="addDebt(event)">
 <div class="field"><label>Tipo</label><select id="dt"><option>Despesa</option><option>Dívida</option><option>Empréstimo</option><option>Compra no cartão</option></select></div>
 <div class="field"><label>Credor / instituição</label><input id="dc" required placeholder="Ex.: Cartão do sogro"></div>
 <div class="field"><label>Descrição</label><input id="dd" required></div><div class="field"><label>Valor da parcela</label><input id="dv" type="number" step=".01" required></div>
 <div class="field"><label>Parcelas</label><input id="dp" type="number" min="1" value="1"></div><div class="field"><label>Vencimento</label><input id="dx" type="date" required></div>
 <div class="field"><label>De onde sairá o pagamento?</label><select id="ds"><option>Caixa</option><option>Conta bancária</option><option>Pix</option><option>Carteira</option><option>Cartão de crédito</option></select></div>
 <div class="field"><label>Tipo de pagamento</label><select id="dr"><option value="unico">Único</option><option value="recorrente">Recorrente — mesmo valor/data</option><option value="parcelado">Parcelado</option></select></div>
 <div class="field full"><div class="notice">O tipo de pagamento é apenas uma característica do compromisso. Se for recorrente, o RAFLO repete o mesmo valor e a mesma data mensalmente.</div></div>
 <div class="field full"><button class="btn">Adicionar compromisso</button></div></form></div>
 <div class="section card"><h2>Compromissos cadastrados</h2>${debtTable(activeTab)}</div>`;
}
function debtTab(t){localStorage.setItem('raflo_debt_tab',t);render()}
function addDebt(e){e.preventDefault();let value=+dv.value, total=value*(+dp.value||1);state.debts.push({type:dt.value,creditor:dc.value,description:dd.value,value,total,installments:+dp.value||1,due:dx.value,source:ds.value,recurring:dr.value==='recorrente',status:'aberto'});persist();render()}
function debtTable(tab){
 let arr=state.debts.filter(x=>tab==='todos'||(tab==='cartoes'&&x.type==='Compra no cartão')||(tab==='emprestimos'&&x.type==='Empréstimo')||(tab==='recorrentes'&&x.recurring));
 if(!arr.length)return '<div class="empty">Nenhum compromisso cadastrado.</div>';
 return `<div class="table"><table><thead><tr><th>Credor</th><th>Tipo</th><th>Vencimento</th><th>Parcela</th><th>Total</th><th>Status</th></tr></thead><tbody>${arr.map(x=>`<tr><td><b>${x.creditor}</b><br><span class="muted">${x.description}</span></td><td>${x.type}${x.recurring?' • mensal':''}</td><td>${new Date(x.due+'T12:00:00').toLocaleDateString('pt-BR')}</td><td>${brl(x.value)} × ${x.installments}</td><td class="red">${brl(x.total)}</td><td><span class="pill ${x.status==='pago'?'green':x.status==='atrasado'?'red':''}">${x.status.toUpperCase()}</span></td></tr>`).join('')}</tbody></table></div>`
}
function receipts(){
 let inTotal=state.receipts.filter(x=>x.status==='recebida').reduce((a,x)=>a+x.value,0);
 return head('Receitas','Separe o que está previsto do que realmente entrou no caixa.')+
 `<div class="tabs"><button class="tab active">Receita prevista</button><button class="tab">Receita recebida</button><button class="tab">Livro caixa</button></div>
 <div class="grid"><div class="card metric"><div class="label">Previstas</div><div class="value green">${brl(state.receipts.filter(x=>x.status==='prevista').reduce((a,x)=>a+x.value,0))}</div></div><div class="card metric"><div class="label">Recebidas</div><div class="value green">${brl(inTotal)}</div></div><div class="card metric"><div class="label">Hoje</div><div class="value">${brl(0)}</div></div><div class="card metric"><div class="label">Lançamentos</div><div class="value">${state.receipts.length}</div></div></div>
 <div class="section card"><h2>Nova receita</h2><form class="form" onsubmit="addReceipt(event)"><div class="field"><label>Tipo</label><select id="rt"><option>Receita diária</option><option>Salário</option><option>Freelance</option><option>Outros recebimentos</option><option>Empréstimo recebido</option></select></div><div class="field"><label>Valor</label><input id="rv" type="number" step=".01" required></div><div class="field"><label>Data prevista / recebida</label><input id="rd" type="date" required></div><div class="field"><label>De onde veio?</label><input id="ro" required placeholder="Pessoa, empresa, app..."></div><div class="field"><label>Precisa pagar de volta?</label><select id="rr"><option>Não</option><option>Sim</option></select></div><div class="field full"><button class="btn">Registrar receita</button></div></form></div>
 <div class="section card"><h2>Receitas cadastradas</h2><div class="list">${state.receipts.length?state.receipts.slice().reverse().map(x=>`<div class="item"><span class="pill green">${x.status.toUpperCase()}</span><span><b>${x.type}</b><small>${x.origin} • ${x.returnable}</small></span><strong class="green">${brl(x.value)}</strong></div>`).join(''):'<div class="empty">Nenhuma receita cadastrada.</div>'}</div></div>`
}
function addReceipt(e){e.preventDefault();state.receipts.push({type:rt.value,value:+rv.value,date:rd.value,origin:ro.value,returnable:rr.value,status:'prevista'});persist();render()}
function planning(){
 return head('Planejamento','Organização por mês e por semana, com diária recalculada conforme o ciclo.')+
 `<div class="grid"><div class="card metric"><div class="label">Total do mês a pagar</div><div class="value red">${brl(state.debts.reduce((a,x)=>a+x.value,0))}</div></div><div class="card metric"><div class="label">Total a receber</div><div class="value green">${brl(0)}</div></div><div class="card metric"><div class="label">Caixa</div><div class="value green">${brl(totals().bal)}</div></div><div class="card metric"><div class="label">Buscar por dia</div><div class="value">${brl(state.debts.reduce((a,x)=>a+x.value,0)/20)}</div></div></div>
 <div class="section card"><div class="row"><div><h2>Agosto 2026</h2><div class="muted">Semanas compactadas para não criar semanas artificiais no início/fim do mês.</div></div><button class="btn light">Escolher folga</button></div><div class="section week current"><div class="row"><b>Semana 1 — 03 à 09 de Agosto de 2026</b><span class="pill">ATUAL</span></div><div class="weekdays">${['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'].map((d,i)=>`<div class="day"><b>${d}</b><small>${3+i}/08</small><strong class="${i%2?'negative':'positive'}">${i===0?'A pagar R$ 0,00':'Receita R$ 0,00'}</strong></div>`).join('')}</div><div class="grid"><div><div class="label">Total a pagar</div><div class="value red">R$ 0,00</div></div><div><div class="label">Total a receber</div><div class="value green">R$ 0,00</div></div><div><div class="label">Saldo devedor</div><div class="value">R$ 0,00</div></div><div><div class="label">Diária</div><div class="value">R$ 0,00</div></div></div></div></div>`
}
function calendar(){
 let weeks=['03 à 09 de Agosto de 2026','10 à 16 de Agosto de 2026','17 à 23 de Agosto de 2026','24 à 30 de Agosto de 2026','31 de Agosto à 06 de Setembro de 2026'];
 return head('Calendário Financeiro','Pagamentos e recebimentos em ordem cronológica. A semana atual fica em destaque.')+
 weeks.map((w,i)=>`<div class="section card week ${i===2?'current':''}"><div class="row"><div><div class="ey">SEMANA ${i+1}</div><h2>${w}</h2></div>${i===2?'<span class="pill">SEMANA ATUAL</span>':''}</div><div class="list"><div class="item"><span class="pill red">A PAGAR</span><span>Compromissos da semana<small>Credores unificados quando o vencimento pertence ao mesmo período.</small></span><strong class="red">R$ 0,00</strong></div><div class="item"><span class="pill green">RECEITAS</span><span>Receitas adquiridas na semana<small>Abatem o valor necessário para os pagamentos atuais e posteriores.</small></span><strong class="green">R$ 0,00</strong></div></div><div class="grid"><div><div class="label">Total a pagar</div><div class="value red">R$ 0,00</div></div><div><div class="label">Total a receber</div><div class="value green">R$ 0,00</div></div><div><div class="label">Saldo após receitas</div><div class="value">R$ 0,00</div></div><div><div class="label">Diária necessária</div><div class="value">R$ 0,00</div></div></div></div>`).join('')
}
function reports(){
 let t=totals();
 return head('Relatórios','Panorama semanal, mensal e anual, sem perder os detalhes importantes.')+
 `<div class="tabs"><button class="tab active">Semana</button><button class="tab">Mês</button><button class="tab">Ano</button></div>
 <div class="grid"><div class="card metric"><div class="label">Receitas</div><div class="value green">${brl(t.i)}</div></div><div class="card metric"><div class="label">Despesas</div><div class="value red">${brl(t.o)}</div></div><div class="card metric"><div class="label">Resultado</div><div class="value">${brl(t.bal)}</div></div><div class="card metric"><div class="label">Compromissos</div><div class="value red">${brl(state.debts.reduce((a,x)=>a+x.value,0))}</div></div></div>
 <div class="section card"><h2>Composição financeira</h2><div class="muted">Receitas x pagamentos x compromissos</div><div class="bar"><span style="width:${Math.min(100,t.i/(t.i+t.o||1)*100)}%"></span></div><div class="section table"><table><tr><th>Indicador</th><th>Semana</th><th>Mês</th><th>Ano</th></tr><tr><td>Receitas recebidas</td><td>${brl(t.i)}</td><td>${brl(t.i)}</td><td>${brl(t.i)}</td></tr><tr><td>Despesas pagas</td><td>${brl(t.o)}</td><td>${brl(t.o)}</td><td>${brl(t.o)}</td></tr><tr><td>Saldo</td><td>${brl(t.bal)}</td><td>${brl(t.bal)}</td><td>${brl(t.bal)}</td></tr></table></div></div>`
}
function settings(){
 return head('Configurações','Tudo separado por blocos simples, sem uma página visualmente carregada.')+
 `<div class="grid"><div class="card"><h2>Aparência</h2><div class="muted">Tema claro ou escuro.</div><button class="btn light section" onclick="toggleTheme()">Alternar tema</button></div><div class="card"><h2>Fontes financeiras</h2><div class="muted">Caixa, conta bancária, Pix e carteira.</div></div><div class="card"><h2>Semana financeira</h2><div class="muted">Primeiro dia da semana, folgas e cálculo da diária.</div></div><div class="card"><h2>Moeda</h2><div class="muted">Real brasileiro (BRL).</div></div><div class="card"><h2>Conta e segurança</h2><div class="muted">Perfil, celular, senha e sessão.</div></div><div class="card"><h2>Sincronização</h2><div class="muted">Dados sincronizados com o Supabase na versão integrada.</div></div></div>`
}
function render(){
 document.body.classList.toggle('dark',state.dark);
 $('page').innerHTML={dashboard,cash,debts,receipts,planning,calendar,reports,settings}[state.page]();
 document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===state.page));
}
render();
