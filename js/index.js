$(function () {
   
    /* 点击 一级列表 的主题名称的交互控制*/
    $('body').on('click','.NavLiContent .TopicName',function(){

        $(this).parents('.NavLi').siblings('.NavLi').removeClass('active');
        $(this).parents('.NavLi').toggleClass('active');
        if(!!$(this).attr('data-topic')){
            var topic=$(this).attr('data-topic');
            $(".ContentDiv").css({display:'none'});
            $('.'+topic).css({display:'block'});
            if(topic==='survey'){
                $('.BeforeSubmit').css({'display':'block'});
                $('.AfterSubmit').css({'display':'none'});
            }
        }
    })
      /* 点击 二级列表 的主题名称的交互控制*/
    $('body').on('click','.SecondNavLi .TopicName',function(event){
        event.stopPropagation();
        $(this).parents('.SecondNavLi').siblings('.SecondNavLi').removeClass('active');
        $(this).parents('.SecondNavLi').addClass('active');
        $(this).parents('.NavLi').addClass('active');
        if(!!$(this).attr('data-topic')){
            var topic=$(this).attr('data-topic');
            $(".ContentDiv").css({display:'none'});
            $('.'+topic).css({display:'block'});
            if(topic==='SearchLaw'){
                $('.BeforeSearch').css({'display':'block'});
                $('.AfterSearch').css({'display':'none'});
                onlyOneLine('.HeadLine');
            }
        }
    })
})








