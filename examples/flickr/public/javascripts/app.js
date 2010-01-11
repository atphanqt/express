tb_pathToImage = '/public/images/loadingAnimation.gif';

var old_tb_show= tb_show;
var old_tb_remove= tb_remove;
var pf,upf;

tb_show=  function(caption, url, imageGroup){
    old_tb_show(caption, url, imageGroup);
    if(pf) pf();
}

tb_remove=  function() {
    old_tb_remove();
    if(upf) upf();
}

$(function(){
    var api_key= $('input[name=api_key]');
    var user_name= $('input[name=user_name]');
     $("#scroller").jCarouselLite({
        auto: 800,
        speed: 1000,
        visible: 4.5,
        easing: "easeinout",
        pauseOnHover: false,
        referenceCallback: function(pauseFunction, unPauseFunction) {
            pf= pauseFunction;
            upf= unPauseFunction;
        }
       });
})