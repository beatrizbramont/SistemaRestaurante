const inputs = document.querySelectorAll(".otp-inputs input")

inputs.forEach((input, index) => {

input.addEventListener("input", () => {

if(input.value.length === 1 && inputs[index+1]){
inputs[index+1].focus()
}

/* se todos os campos estiverem preenchidos envia automaticamente */

let completo = true

inputs.forEach(i=>{
if(i.value === ""){
completo = false
}
})

if(completo){
document.getElementById("otpForm").requestSubmit()
}

})

/* voltar com backspace */

input.addEventListener("keydown",(e)=>{

if(e.key === "Backspace" && input.value === "" && inputs[index-1]){
inputs[index-1].focus()
}

})

})

document.getElementById("otpForm").addEventListener("submit", async (e)=>{

e.preventDefault()

let codigo = ""

inputs.forEach(input=>{
codigo += input.value
})

const email = localStorage.getItem("email_otp")

try{

const resposta = await fetch("http://localhost:8002/auth/verificar-otp",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
email:email,
otp:codigo
})

})

const dados = await resposta.json()

if(resposta.ok){

inputs.forEach(input=>{
input.classList.add("success")
})

localStorage.setItem("token",dados.token)

setTimeout(()=>{
window.location.href="home.html"
},800)

}else{

inputs.forEach(input=>{
input.classList.add("erro")
})

setTimeout(()=>{
inputs.forEach(input=>{
input.classList.remove("erro")
input.value=""
})

inputs[0].focus()

},500)

alert(dados.erro)

}

}catch(erro){

console.error("Erro:",erro)
alert("Erro ao verificar código")

}

})

const reenviarBtn = document.getElementById("reenviarOtp")

if(reenviarBtn){

reenviarBtn.addEventListener("click", async ()=>{

const email = localStorage.getItem("email_otp")

try{

const resposta = await fetch("http://localhost:8002/auth/reenviar-otp",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
email:email
})

})

const dados = await resposta.json()

if(resposta.ok){

alert("Novo código enviado para seu email")

inputs.forEach(input=>{
input.value=""
})

inputs[0].focus()

}else{

alert(dados.erro)

}

}catch(erro){

console.error(erro)
alert("Erro ao reenviar código")

}

})

}
