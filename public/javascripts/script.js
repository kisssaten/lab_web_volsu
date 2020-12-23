var btn_reg_back = document.getElementById("reg_back");
var regModal = document.getElementById("regModal");
var signModal = document.getElementById("signModal");
var btn_sign = document.getElementById("sign");
var btn_auth = document.getElementById("auth");
var btn_reg = document.getElementById("reg");

btn_reg_back.onclick = function () {
    signModal.style.display = "block";
    regModal.style.display = "none";
}
btn_sign.onclick = function () {
    signModal.style.display = "block";
}
btn_reg.onclick = function () {
    signModal.style.display = "none";
}

window.onclick = function (event) {
    if (event.target === signModal) {
        signModal.style.display = "none";
    }
    if (event.target === regModal) {
        regModal.style.display = "none";
    }
}
