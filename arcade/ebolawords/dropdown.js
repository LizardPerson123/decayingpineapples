function touchShow() {
  getById("dropdiv").removeEventListener("click", touchShow)
  getById("dropdivStyle").innerHTML = `
  .dropdown-content a:hover {background-color: #ddd;}
        
  .dropdown .dropdown-content {display: block;}

  .dropdown:hover .dropbtn {background-color: #3e8e41;}`
  
  getById("dropText").innerHTML = "Hide"
  getById("dropdiv").addEventListener("click", touchHide)
}

function touchHide() {
  getById("dropdiv").removeEventListener("click", touchHide)
  getById("dropdivStyle").innerHTML = ``
  getById("dropText").innerHTML = "Options"
  getById("dropdiv").addEventListener("click", touchShow)
}

window.addEventListener("DOMContentLoaded", () => {getById("dropdiv").addEventListener("click", touchShow)})