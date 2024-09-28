window.onload = function () {
        const username = localStorage.getItem('username');
        if(!username)
        {
            document.getElementById('registrationForm').addEventListener('submit', function (e) {
                e.preventDefault();
                const errormsg = document.getElementById('error')
                const username = document.getElementById('username').value;
                if (username.length == 0) {
                    errormsg.innerHTML = "Please enter a username"
                    errormsg.style.display = 'block';
                    setTimeout(() => {
                        errormsg.innerHTML = "";
                        errormsg.style.display = 'none';
                    }, 5000);
                    return
                }
                errormsg.style.display = 'none';
                localStorage.setItem('username', username);
                window.location.href = '/home/homepage.html';
            });
        }else{
            window.location.href = '/home/homepage.html';
        }
       
    }