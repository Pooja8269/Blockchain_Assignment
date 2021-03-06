function chkUser(userObj){
    let headers =  new Headers();
    headers.set('Authorization', 'Basic '+btoa(userObj.username + ":" + userObj.password));
    fetch('http://localhost:3913/blockchain/users',
            {method: 'GET',
             headers: headers,
             credentials: "same-origin"
            }
    ).then((res) =>{
        return res.json();
    }).then((data) =>{
        if(data.data.status == true){  
            
    if (typeof(Storage) !== "undefined") {
                sessionStorage.publicKey = data.data.key;
                 sessionStorage.username = userObj.username;
                 
                
              } else {
                alert('no storage');
              }
            if(userObj.username == 'Admin'){
                $('#loadContent').load('admin');
                sessionStorage.setItem("username", userObj.username);
            }else{
                $('#loadContent').load('user');
                sessionStorage.setItem("username", userObj.username);
 }
           
        }else{
           
            alert('User does not exist');
            
        }
    });
}   

function addUser(userObj){
    console.log(userObj);
    fetch('http://localhost:3913/blockchain/adduser',{
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(userObj)  
    }).then((res) =>{
        return res.json();
    }).then((data) =>{
        if(!data.statusMsg){
            alert('Sorry!! Username already exist');
        }else{
            alert('New user added successfully...\n Welcome '+userObj.User_Name);
            window.location.pathname = '/';
        }
    })
}

function getUserKey(sellerName){
    console.log(sellerName);
    let headers = new Headers();
    headers.set("Authorization", "Basic "+btoa(sellerName));
    var promise = fetch('http://localhost:3913/blockchain/getuserkey',{
        method:'GET',
        headers: headers,
        credentials: "same-origin"
    });
    return promise;
}

function logout(){
    fetch('http://localhost:3913/blockchain/logout', {
        method: 'GET',
        credentials: 'same-origin'
    }).then( (res) => {
       return res.json();
    }).then( (data) =>{
        if(data.status == 200){
            sessionStorage.clear();
            window.location.pathname = '/';
        }else{
            alert('Unable to logout');
        }
    });
}