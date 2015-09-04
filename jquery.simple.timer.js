/*
* jQuery-Simple-Timer
*
* Creates a countdown timer.
*
* Example:
*   $('.timer').startTimer();
*
*/
(function($){

  var timer, startTime;

  startTime = new Date();

  var Timer = function(targetElement){
    this.targetElement = targetElement;
    return this;
  };

  Timer.start = function(options, targetElement){
    timer = new Timer(targetElement);
    return timer.start(options);
  };

  Timer.prototype.start = function(options) {

    var createSubDivs = function(timerBoxElement){
      var seconds = document.createElement('div');
      seconds.className = 'seconds';

      var minutes = document.createElement('div');
      minutes.className = 'minutes';

      var hours = document.createElement('div');
      hours.className = 'hours';

      var days = document.createElement('div');
      days.className = 'days';

      var clearDiv = document.createElement('div');
      clearDiv.className = 'clearDiv';

      return timerBoxElement.
      	append(days).
        append(hours).
        append(minutes).
        append(seconds).
        append(clearDiv);
    };

    this.targetElement.each(function(_index, timerBox) {
      var timerBoxElement = $(timerBox);
      var cssClassSnapshot = timerBoxElement.attr('class');

      timerBoxElement.on('complete', function() {
        clearInterval(timerBoxElement.intervalId);
      });

      timerBoxElement.on('complete', function() {
        timerBoxElement.onComplete(timerBoxElement);
      });

      timerBoxElement.on('complete', function(){
        timerBoxElement.addClass('timeout');
      });

      timerBoxElement.on('complete', function(){
        if(options && options.loop === true) {
          timer.resetTimer(timerBoxElement, options, cssClassSnapshot);
        }
      });

      createSubDivs(timerBoxElement);
      return this.startCountdown(timerBoxElement, options);
    }.bind(this));
  };

  /**
   * Resets timer and add css class 'loop' to indicate the timer is in a loop.
   * $timerBox {jQuery object} - The timer element
   * options {object} - The options for the timer
   * css - The original css of the element
   */
  Timer.prototype.resetTimer = function($timerBox, options, css) {
    var interval = 0;
    if(options.loopInterval) {
      interval = parseInt(options.loopInterval, 10) * 1000;
    }
    setTimeout(function() {
      $timerBox.trigger('reset');
      $timerBox.attr('class', css + ' loop');
      timer.startCountdown($timerBox, options);
    }, interval);
  }

  Timer.prototype.fetchSecondsLeft = function(element){
    var secondsLeft = element.data('seconds-left');
    var minutesLeft = element.data('minutes-left');

    if(secondsLeft){
      return parseInt(secondsLeft, 10);
    } else if(minutesLeft) {
      return parseFloat(minutesLeft) * 60;
    }else {
      throw 'Missing time data';
    }
  };

  Timer.prototype.startCountdown = function(element, options) {
    options = options || {};

    var intervalId = null;
    var defaultComplete = function(){
      clearInterval(intervalId);
      return this.clearTimer(element);
    }.bind(this);

    element.onComplete = options.onComplete || defaultComplete;

    var secondsLeft = this.fetchSecondsLeft(element);

    var refreshRate = options.refreshRate || 1000;
    var endTime = secondsLeft + this.currentTime();
    var timeLeft = endTime - this.currentTime();

    this.setFinalValue(this.formatTimeLeft(timeLeft), element);

    intervalId = setInterval((function() {
      timeLeft = endTime - this.currentTime();
      this.setFinalValue(this.formatTimeLeft(timeLeft), element);
    }.bind(this)), refreshRate);

    element.intervalId = intervalId;
  };

  Timer.prototype.clearTimer = function(element){
    element.find('.seconds').text('00');
    element.find('.minutes').text('00:');
    element.find('.hours').text('00:');
    element.find('.days').text('00:');
  };

  Timer.prototype.currentTime = function() {
    return Math.round((new Date()).getTime() / 1000);
  };

  Timer.prototype.formatTimeLeft = function(timeLeft) {

    var lpad = function(n, width) {
      width = width || 2;
      n = n + '';

      var padded = null;

      if (n.length >= width) {
        padded = n;
      } else {
        padded = Array(width - n.length + 1).join(0) + n;
      }

      return padded;
    };

    var days, hours, minutes, endTime, currentTime, seconds;
    currentTime = new Date(this.currentTime() * 1000);
    endTime = new Date(startTime.getTime() + (timeLeft * 1000));
    var oneDay = 24*60*60*1000;


    //figure out how to handle < 1 full day
	days = Math.round(Math.abs((startTime.getTime() - endTime.getTime())/(oneDay)));
    hours = new Date(endTime.getTime() - currentTime.getTime()).getUTCHours();
    minutes = new Date(endTime.getTime() - currentTime.getTime()).getUTCMinutes();
    seconds = new Date(endTime.getTime() - currentTime.getTime()).getUTCSeconds();

    if (+days === 0 && +hours === 0 && +minutes === 0 && +seconds === 0) {
      return [];
    } else {
    	console.log([lpad(days), lpad(hours), lpad(minutes), lpad(seconds)]);
      return [lpad(days), lpad(hours), lpad(minutes), lpad(seconds)];
    }
  };

  Timer.prototype.setFinalValue = function(finalValues, element) {

    if(finalValues.length === 0){
      this.clearTimer(element);
      element.trigger('complete');
      return false;
    }
    element.find('.seconds').text(finalValues.pop());
    element.find('.minutes').text(finalValues.pop() + ' : seconds ');
    element.find('.hours').text(finalValues.pop() + ' : minutes ');
    element.find('.days').text(finalValues.pop() + ' : hours ');
  };


  $.fn.startTimer = function(options) {
    Timer.start(options, this);
    return this;
  };
})(jQuery);
