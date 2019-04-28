var swidth = null; //获取屏幕的宽度
function autoFit() {
    swidth = $(window).width();
    if (swidth > 1000 || swidth === 1000) {
        resize();
    }
}

//整屏等比缩放
function resize() {
    var winratio = $(window).width() / 1920;
    $('.body1').css({
        transform: "scale(" + winratio + ")",
        transformOrigin: "left top",
        height: winratio * 1080 + 'px'
    });
}

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function ( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
            return window.setTimeout(callback, 1000 / 60);
        };
})();



//利用canvas绘制曲线
/**
 * 
 * @param {string} elementId 绘制曲线的canvas的ID
 * @param {string} elementClass 曲线组件/光点的最大容器
 * @param {array} arr    相关数据状态的数组
 */
function draw(elementId, elementClass, arr) {
    var canvas = document.getElementById(elementId);
    //var boxHeight=canvas.style.height;
    //设置或得到整个canvas的高度
    var n = arr.length;
    var boxHeight = $('#' + elementId).height(); //canvas的高度 待完善
    var boxWidth = $('#' + elementId).width(); //canvas的宽度 待完善
    var perHeight = parseInt(boxHeight / n);
    var centerY = parseInt(boxHeight / 2);
    var context = canvas.getContext('2d');


    //绘制2次贝塞尔曲线 
    context.setLineDash([3, 3]); //设置线条为虚线的样式
    for (var i = 0; i < n; i++) {
        var startY = perHeight / 2 + perHeight * i;
        var controlY = parseInt(centerY + perHeight / 16 * (i - n / 2));
        context.beginPath();

        context.moveTo(0, startY); //曲线绘制的起点
        //quadraticCurveTo(cpx,cpy,x,y)　　//cpx，cpy表示控制点的坐标,x，y表示终点坐标；
        //曲线绘制的控制点位整个canvas
        context.quadraticCurveTo(30, controlY, boxWidth, centerY);
        $(elementClass + ' .lignt-box').append('<span class="line-icon"  data-type="' + arr[i].type + '"></span>');
        if (arr[i].status === 'warn') {
            context.strokeStyle = "#e75a19"; //数据异常时： 设置贝塞尔曲线的颜色
            $(elementClass + ' .line-icon').eq(i).addClass('warn');
        } else if (arr[i].status === 'no-update') {
            context.strokeStyle = "#e8c219"; //数据未更新时： 设置贝塞尔曲线的颜色
            $(elementClass + ' .line-icon').eq(i).addClass('no-update');
        } else {
            context.strokeStyle = "#5a9ce8"; //数据正常时： 设置贝塞尔曲线的颜色  
        }

        context.stroke();
    }
}

//移动点的原型
/**
 * 
 * @param {*} element   移动点的父元素的选择器
 * @param {*} n         总共移动点的数量
 * @param {*} direction     需要绘制曲线的方向,只能为 "converage"|'spread'
 */
function LightLoop(element, arr, type) {
    this.element = element;
    this.n = arr.length;
    this.type = type;
    this.boxHeight = $(this.element).height(); //移动点的的高度  
    this.boxWidth = $(this.element).width(); //移动点的父元素的的宽度
    this.perHeight = parseInt(this.boxHeight / this.n);
    this.childWidth = 34 || $(this.element).children().width(); //移动点的子元素的宽度    
    this.childHeight = 14 || $(this.element).children().height(); //移动点的子元素的高度
    this.warnChildWidth = 36;
    this.warnChildHeight = 36;

    //控制点p1统一为
    this.controlX = 30; //离canvas做左侧的水平距离 统一为30；
    //终点p2统一为右边终点
    this.endX = this.boxWidth;
    this.endY = this.boxHeight / 2; //垂直中心
    this.radio = 0; //贝塞尔曲线的比值

    var _this = this;
    var LightTurnOn = setInterval(function () {
        _this.turn();
    }, 40)

    this.turn = function () {
        if (this.radio >= 1) {
            this.radio = 0
        } else {
            this.radio = this.radio + 0.005;
        }
        for (var i = 0; i < this.n; i++) {
            var obj = {};
            //控制点p1
            obj.controlY = this.boxHeight / 2 + this.perHeight / 16 * (i - this.n / 2);
            //如果是光点往集中方向移动的类型
            if (this.type === "converage") {
                //起点p0                
                obj.startX = 0; //离canvas做左侧的水平距离            
                obj.startY = this.perHeight / 2 + this.perHeight * i; //离canvas顶部的垂直距离  
                obj.endX = this.endX;
                obj.endY = this.endY;
                //计算斜率，得到点的切线方向，得到角度
                obj.k = [(1 - this.radio) * (obj.controlY - obj.startY) + this.radio * (obj.endY - obj.controlY)] / [(1 - this.radio) * (this.controlX - obj.startX) + this.radio * (obj.endX - this.controlX)];
                //根据斜率，求得需要切斜的角度 单位为弧度，/0.017453293 转化为角度
                obj.angle = Math.atan(obj.k) / 0.017453293; //根据斜率得到旋转角度
                //如果是光点往分散方向移动的类型
            } else {
                obj.startX = this.endX;
                obj.startY = this.endY;
                obj.endX = 0;
                obj.endY = this.perHeight / 2 + this.perHeight * i;

                //计算斜率，得到点的切线方向，得到角度
                obj.k = [(1 - this.radio) * (obj.controlY - obj.startY) + this.radio * (obj.endY - obj.controlY)] / [(1 - this.radio) * (this.controlX - obj.startX) + this.radio * (obj.endX - this.controlX)];

                //根据斜率，求得需要切斜的角度 单位为弧度，/0.017453293 转化为角度
                obj.angle = Math.atan(obj.k) / 0.017453293 + 180; //根据斜率得到旋转角度，+180另外图标自身要换反方向
            }
            //根据比值this.radio变化计算点的坐标值；p=(1-this.radio)*(1-this.radio)p0+2*this.radio*(1-this.radio)*p1+this.radio*this.radio*p2;
            if (arr[i].status === 'warn') {
                //固定中间
                radio = 0.5;
                obj.nowX = (1 - radio) * (1 - radio) * obj.startX + 2 * radio * (1 - radio) * this.controlX + radio * radio * obj.endX;
                obj.nowY = (1 - radio) * (1 - radio) * obj.startY + 2 * radio * (1 - radio) * obj.controlY + radio * radio * obj.endY;
                $(this.element + ' .line-icon:eq(' + i + ')').css({
                    'left': obj.nowX - this.warnChildWidth / 2,
                    'top': obj.nowY - this.warnChildHeight / 2
                });
            } else {
                obj.nowX = (1 - this.radio) * (1 - this.radio) * obj.startX + 2 * this.radio * (1 - this.radio) * this.controlX + this.radio * this.radio * obj.endX;
                obj.nowY = (1 - this.radio) * (1 - this.radio) * obj.startY + 2 * this.radio * (1 - this.radio) * obj.controlY + this.radio * this.radio * obj.endY;
                $(this.element + ' .line-icon:eq(' + i + ')').css({
                    'left': obj.nowX - this.childWidth / 2,
                    'top': obj.nowY - this.childHeight / 2,
                    'transform': 'rotate(' + obj.angle + 'deg)'
                });
            }


        }
    }

    //重置光点移动方式
    this.setType = function (newType) {
        this.type = newType;
        clearInterval(LightTurnOn);
        this.radio = 0; //重置曲线的绘制比值
        LightTurnOn = setInterval(function () {
            _this.turn();
        }, 40)
    }

}

//循环播放中间球体数据
function CenterValueLoop() {
    var ListNumArr = ['233,444', '233,566', '33,589'];
    var KbNumArr = ['789,233,444', '677,233,566', '556,533,589'];
    var i = 0;
    //循环数据播放
    setInterval(function () {
        $('.list-num').html(ListNumArr[i]);
        $('.kb-num').html(KbNumArr[i]);
        if (i >= ListNumArr.length) {
            i = 0
        } else {
            i++;
        }
    }, 500)

};


/**
 * 各市区信息显示模块（容器为.center-bottom）：鼠标滚动时水平移动/自动滚动/点击左箭头，左滚动/点击右箭头右滚动
 * @param {Integer} n 点击按钮/鼠标滚动的个数
 */
function selfCustomScroll(n) {
    /* 仿滚动条 */
    var cityLength = $('.city-data-li').length;

    $(".center-bottom").mCustomScrollbar({
        axis: "x", //"x","y",值为字符串，分别对应横纵向滚动
        // scrollButtons: {
        //     enable: false,
        //     //scrollAmount: $('.city-data-li').width() * n + 50 *n
        // }  
    })

}

/**   
 * 功能 鼠标进入时，停止滚动/鼠标离开时，自动滚动
 * @param {string}  element 作用对象dom
 * @param {Integer} n 自动滚动个数
 */
var nowIndex = 0;

function autoScrollFun(element, n) {

    var isAuto = true; //是否自动滚动
    var $this = $(element);
    var scrollTimer = null;
    $(element).parent().hover(function () {
        clearInterval(scrollTimer);
    }, function () {
        scrollTimer = setInterval(function () {
            if (isAuto) {
                scrollNews($this, n);
            }
        },3000);
    }).trigger('mouseleave');


    var cityLength = $this.find('li').length;
    var perUnitWidth = parseInt($this.find('li').width() + 50 );
    $this.find('ol').css('width', perUnitWidth * cityLength + 100 + 'px');
    //posLeft 允许滚动范围  $this.width-$('.city-data-list').width< posLeft<$('.city-data-list').width-$this.width
    var $self = $this.find('ol');
    var minLeft = $this.width() - $self.width();
    var maxLeft = 0;

    //点击按钮-- 左箭头
    $("body").on('click', '.prevButton', function () {
        //clearInterval(scrollTimer);
        var leftPos = removePx($self.css('left'));
        var needGap = 0;
        for (var i = nowIndex; i < nowIndex + n; i++) {
            var liWidth = $self.find('li').eq(i).width() + 50 + 4;
            needGap += liWidth;
        }
        leftPos -= needGap;
        $('.nextButton').removeClass('hidden');
        if (leftPos < minLeft) {
            $self.animate({
                left: minLeft + 'px'
            }, 1000);
            $('.prevButton').addClass('hidden');
            nowIndex = cityLength - 5;
        } else {
            $self.animate({
                left: leftPos + 'px'
            }, 1000);
            nowIndex += n;
        }
    });

    //点击按钮-- 左箭头
    $("body").on('click', '.nextButton', function () {
        //clearInterval(scrollTimer);
        var leftPos = removePx($self.css('left'));
        var needGap = 0;
        for (var i = nowIndex - n; i < nowIndex; i++) {
            var liWidth = $self.find('li').eq(i).width() + 50 + 4;
            needGap += liWidth;
        }
        leftPos += needGap;
        $('.prevButton').removeClass('hidden');
        if (leftPos > maxLeft) {
            $self.animate({
                left: maxLeft + 'px'
            }, 1000);
            $('.nextButton').addClass('hidden');
            nowIndex = 0;
        } else {

            $self.animate({
                left: leftPos + 'px'
            }, 1000);
            nowIndex -= n;
        }
    })
    /**  
     * 功能 使某个容器自动滚动 
     * @param {Object} obj  需要滚动的容器
     * @param {int} n  每次滚动的个数
     */

    function scrollNews(obj, n) {
        if (obj.find('ol').length) {
            var $self = obj.find('ol');
            var oldLeft = removePx($self.css('left'));
            var needGap = 0;
            for (var i = 0; i < n; i++) {
                //获得第n个li的高度
                var liWidth = $self.find('li').eq(i).width() + 50;
                needGap += liWidth;
            }
            leftPos = oldLeft-needGap;
            
            $('.prevButton').removeClass('hidden');
            $('.nextButton').removeClass('hidden');

            //并根据此高度向上移动
            if (leftPos > maxLeft) {
                $self.animate({
                    left: maxLeft + 'px'
                }, 1000,function(){back();});
                $('.nextButton').addClass('hidden');
            } else if (leftPos < minLeft) {
                $self.animate({
                    left: minLeft + 'px'
                }, 1000,function(){back();});
                $('.prevButton').addClass('hidden');
            } else {
                $self.animate({
                    left: leftPos + 'px'
                }, 1000,function(){back();});
            }

            //恢复left,将第一个li元素，排列放置到末尾，达到循环播放的目的
            function back(){
                $self.css({left: oldLeft+'px'});
                for(var i=0;i<n;i++){
                    $self.find('li:first').appendTo($self);
                }
            }  
        }
    }
}



/**  
 * 功能 去除字符串的‘px’,并转化为数字类型 
 * @param {string} str  需要处理的字符串
 */
function removePx(str) {
    var i = str.indexOf('px');
    var numStr = str.substring(0, i);
    return parseInt(numStr);
}