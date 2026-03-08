const drawer=document.getElementById('drawer');
const backdrop=document.getElementById('backdrop');
const menuBtn=document.getElementById('menuBtn');
const drawerItems=[...document.querySelectorAll('.drawer-item')];
const pages=[...document.querySelectorAll('.page')];

function openDrawer(){drawer.classList.add('open');backdrop.classList.add('show')}
function closeDrawer(){drawer.classList.remove('open');backdrop.classList.remove('show')}
function showPage(name){
  pages.forEach(p=>p.classList.toggle('active', p.dataset.page===name));
  drawerItems.forEach(i=>i.classList.toggle('active', i.dataset.page===name));
  closeDrawer();
}
menuBtn.addEventListener('click', openDrawer);
backdrop.addEventListener('click', closeDrawer);
drawerItems.forEach(item=>item.addEventListener('click', ()=>showPage(item.dataset.page)));
document.querySelectorAll('[data-page-link]').forEach(btn=>btn.addEventListener('click', ()=>showPage(btn.dataset.pageLink)));
document.querySelectorAll('[data-go-study]').forEach(btn=>btn.addEventListener('click', ()=>showPage('studyroom')));
