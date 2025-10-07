// --- Login / registratie ---
function signup() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  if(!username || !password) { alert("Vul alles in!"); return; }
  
  let users = JSON.parse(localStorage.getItem('users') || "{}");
  if(users[username]) { alert("Username bestaat al!"); return; }
  users[username] = { password: password, contacts: [], groups: [] };
  localStorage.setItem('users', JSON.stringify(users));
  alert("Account aangemaakt!");
}

function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  let users = JSON.parse(localStorage.getItem('users') || "{}");
  if(users[username] && users[username].password === password){
    localStorage.setItem('currentUser', username);
    window.location.href = "chat.html";
  } else { alert("Foute login!"); }
}

// --- Chat logic ---
let currentUser = localStorage.getItem('currentUser');
let activeChat = null; // username of contact or group id

if(currentUser && document.getElementById('current-user')){
  document.getElementById('current-user').innerText = currentUser;
  loadContacts();
  loadGroups();
}

function loadContacts(){
  let users = JSON.parse(localStorage.getItem('users') || "{}");
  let list = document.getElementById('contacts-list');
  list.innerHTML = "";
  users[currentUser].contacts.forEach(c => {
    let li = document.createElement('li');
    li.innerText = c;
    li.onclick = () => openChat(c);
    list.appendChild(li);
  });
}

function addContact(){
  let contact = document.getElementById('new-contact').value;
  if(!contact || contact===currentUser) return alert("Ongeldige naam!");
  let users = JSON.parse(localStorage.getItem('users') || "{}");
  if(!users[contact]) return alert("Gebruiker bestaat niet!");
  let cur = users[currentUser].contacts;
  if(cur.includes(contact)) return alert("Contact bestaat al!");
  cur.push(contact);
  localStorage.setItem('users', JSON.stringify(users));
  loadContacts();
}

function loadGroups(){
  let groups = JSON.parse(localStorage.getItem('groups') || "[]");
  let list = document.getElementById('groups-list');
  list.innerHTML = "";
  groups.forEach(g => {
    if(g.members.includes(currentUser)){
      let li = document.createElement('li');
      li.innerText = g.name;
      li.onclick = () => openChat(g.id);
      list.appendChild(li);
    }
  });
}

function createGroup(){
  let name = document.getElementById('new-group').value;
  if(!name) return;
  let groups = JSON.parse(localStorage.getItem('groups') || "[]");
  let id = "group_" + Date.now();
  groups.push({id:id,name:name,members:[currentUser],messages:[]});
  localStorage.setItem('groups', JSON.stringify(groups));
  loadGroups();
}

function openChat(chatId){
  activeChat = chatId;
  let title = document.getElementById('chat-title');
  title.innerText = chatId;
  displayMessages();
}

function displayMessages(){
  let messagesDiv = document.getElementById('messages');
  messagesDiv.innerHTML = "";
  if(!activeChat) return;
  // Check of groep of individueel
  let groups = JSON.parse(localStorage.getItem('groups') || "[]");
  let msgList = [];
  let isGroup = false;
  let group = groups.find(g=>g.id===activeChat);
  if(group){
    msgList = group.messages;
    isGroup = true;
  } else {
    let chats = JSON.parse(localStorage.getItem('chats') || "{}");
    let key = [currentUser,activeChat].sort().join("_");
    msgList = chats[key] || [];
  }
  msgList.forEach(m=>{
    let div = document.createElement('div');
    div.classList.add('message');
    div.classList.add(m.sender===currentUser?"sent":"received");
    div.innerText = m.sender + ": " + m.message;
    messagesDiv.appendChild(div);
  });
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function sendMessage(){
  let input = document.getElementById('message-input');
  let text = input.value;
  if(!text || !activeChat) return;
  let groups = JSON.parse(localStorage.getItem('groups') || "[]");
  let group = groups.find(g=>g.id===activeChat);
  if(group){
    group.messages.push({sender:currentUser,message:text});
    localStorage.setItem('groups', JSON.stringify(groups));
  } else {
    let chats = JSON.parse(localStorage.getItem('chats') || "{}");
    let key = [currentUser,activeChat].sort().join("_");
    chats[key] = chats[key] || [];
    chats[key].push({sender:currentUser,message:text});
    localStorage.setItem('chats', JSON.stringify(chats));
  }
  input.value="";
  displayMessages();
}
