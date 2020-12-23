$(".tab_content").hide();
$(".tab_content:first").show();

$("ul.tabs li").click(function () {
    var activeTab = $(this).attr("rel");
    $("ul.tabs li").removeClass("active");
    $(this).addClass("active");
    $(".tab_accordion").removeClass("d_active");
    $(".tab_accordion[rel^='" + activeTab + "']").addClass("d_active");
});

$(".tab_accordion").click(function () {
    $(".tab_content").hide();
    var d_activeTab = $(this).attr("rel");
    $("#" + d_activeTab).fadeIn();
    $(".tab_accordion").removeClass("d_active");
    $(this).addClass("d_active");
    $("ul.tabs li").removeClass("active");
    $("ul.tabs li[rel^='" + d_activeTab + "']").addClass("active");
});

$('ul.tabs li').last().addClass("tab_last");



function changeRadio(name){
    document.getElementById(name).checked = false;
    if(name == "isp"){
        document.getElementById("ispoln").style.display = "none";
        document.getElementById("zakaz").style.display = "block";
    } else if (name == "zak"){
        document.getElementById("zakaz").style.display = "none";
        document.getElementById("ispoln").style.display = "block";
    } else if (name == "ur"){
        document.getElementById("uri").style.display = "none";
        document.getElementById("fizl").style.display = "block";
    } else if (name == "fiz"){
        document.getElementById("uri").style.display = "block";
        document.getElementById("fizl").style.display = "none";
    }
}

function temp(){document.getElementById('but').disabled = !document.getElementById('but').disabled}