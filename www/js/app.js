// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic','angular-svg-round-progress','ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }

    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.controller('mainCtrl', function($scope, $ionicModal, $timeout, $ionicPlatform) {

        var QiGg_Lessions = [];
        var curr_lesson = [];   
        // Timer
        var mytimeout = null; // the current timeoutID
        $scope.steps = 0;
        $scope.lesson = 0;
        $scope.TotalSteps=0;
        $scope.totalRepeat = 0;
        $scope.gotoStep = 0;
        $scope.repeat_start = false;
        $scope.lessonTitle = "";
        
        $ionicPlatform.ready(function() {
            if( window.plugins && window.plugins.NativeAudio ) {
            // Preload audio resources
            // window.plugins.NativeAudio.preloadComplex( '3beeps', 'audio/Beep-beep-beep.mp3', 1, 1, 0, function(msg){
            // }, function(msg){
            //     console.log( 'error: ' + msg );
            // });

                window.plugins.NativeAudio.preloadSimple( 'beep', 'audio/Beep-tone.mp3', function(msg){
                }, function(msg){
                    console.log( 'error: ' + msg );
                });

            // window.plugins.NativeAudio.preloadSimple( 'ping', 'audio/Ping-sound.mp3', function(msg){
            // }, function(msg){
            //     console.log( 'error: ' + msg );
            // });
            };

            $scope.play = function(sound) {
                if( window.plugins && window.plugins.NativeAudio ) {
                    window.plugins.NativeAudio.play( sound );
                };
            };
            $scope.stop = function(sound) {
            // Stop multichannel clip after 60 seconds
                window.setTimeout( function(){
                    if( window.plugins && window.plugins.NativeAudio ) {
                        window.plugins.NativeAudio.stop( sound );
                        window.plugins.NativeAudio.unload( sound );
                    };
                }, 1000 * 60 );
            };
        });

        // actual timer method, counts down every second, stops on zero
        $scope.onTimeout = function() {
            if ($scope.timer === 0) {
                // console.log( '--------------');
                // console.log( 'gotoStep: ' + $scope.gotoStep.toString() );
                // console.log( 'Step: ' + $scope.step.toString() );

                if (($scope.TotalSteps > $scope.step + 1) || $scope.lesson>0) {
                    if ($scope.gotoStep > 0) {
                        $scope.step = $scope.gotoStep;
                        $scope.gotoStep = 0;
                        //$scope.repeat--;
                    } else {
                        $scope.step++;  
                    };
                    
                    if ($scope.step < curr_lesson.length) {
                        $scope.selectTimer(curr_lesson[$scope.step].duration);
                        $scope.startTimer(); 
                        if (curr_lesson[$scope.step].gotoStep > 0 
                                && curr_lesson[$scope.step].complete === 0 
                                &&  curr_lesson[$scope.step].repeat > 0) {

                            $scope.gotoStep = curr_lesson[$scope.step].gotoStep; 
                            curr_lesson[$scope.step].repeat--;
                            $scope.totalRepeat++;
                            

                            if (curr_lesson[$scope.step].repeat == 0) {
                                curr_lesson[$scope.step].complete = 1;
                                
                            };
                        } else if (curr_lesson[$scope.step].complete === 1 
                                &&  curr_lesson[$scope.step].repeat == 0) {
                            $scope.totalRepeat++;
                        }
                        else {
                            $scope.gotoStep = 0;
                        };
                        // console.log( 'complete: ' + curr_lesson[$scope.step].complete );
                    } else {
                    $scope.$broadcast('timer-stopped', 0);
                    $timeout.cancel(mytimeout);
                    $scope.steps = 0;
                    $scope.lesson = 0;
                    $scope.TotalSteps=0;    
                    //$scope.repeat = 0;             
                    };
                } else {
                    $scope.$broadcast('timer-stopped', 0);
                    $timeout.cancel(mytimeout);
                    $scope.steps = 0;
                    $scope.lesson = 0;
                    $scope.TotalSteps=0;         
                    $scope.repeat = 0;           
                };
                return;
            } 
            else 
            {
                $scope.timer--;
                if ($scope.timer <= 3) {
                    $scope.play("beep");
                };                
                mytimeout = $timeout($scope.onTimeout, 1000);
                return;
            }
        };
        // functions to control the timer
        // starts the timer
        $scope.startTimer = function() {
            mytimeout = $timeout($scope.onTimeout, 1000);
            $scope.started = true;
            $scope.playsound = true;
            if( window.plugins && window.plugins.insomnia ) {
                window.plugins.insomnia.keepAwake(
                    // optional callback
                    function(msg) {}
                );
            };            
        };

        // stops and resets the current timer
        $scope.stopTimer = function(closingModal) {
            if (closingModal != true) {
                $scope.$broadcast('timer-stopped', $scope.timer);
            }
            else  {
                if( window.plugins && window.plugins.insomnia ) { 
                    // window.plugins.insomnia.allowSleepAgain();
                    window.plugins.insomnia.allowSleepAgain(
                        // optional callback
                        function(msg) {}
                    );
                };                
            };
            $scope.timer = $scope.timeForTimer;
            $scope.started = false;
            $scope.paused = false;
            $timeout.cancel(mytimeout);
        };
        // pauses the timer
        $scope.pauseTimer = function() {
            $scope.$broadcast('timer-stopped', $scope.timer);
            $scope.started = false;
            $scope.paused = true;
            $timeout.cancel(mytimeout);
        };

        // triggered, when the timer stops, you can do something here, maybe show a visual indicator or vibrate the device
        $scope.$on('timer-stopped', function(event, remaining) {
            if (remaining === 0 ) {
                $scope.done = true;
            }
        });
        // UI
        // When you press a timer button this function is called
        $scope.selectTimer = function(val) {
            $scope.timeForTimer = val;
            $scope.timer = val
            $scope.started = false;
            $scope.paused = false;
            $scope.done = false;
        };
        $scope.backward  = function() {
            $scope.stopTimer();
            $scope.step--;
            $scope.selectTimer(curr_lesson[$scope.step].duration);
            $scope.startTimer(); 
        };
        $scope.forward  = function() {
            $scope.stopTimer();
            $scope.step++;
            $scope.selectTimer(curr_lesson[$scope.step].duration);
            $scope.startTimer(); 
        };        
        // This function helps to display the time in a correct way in the center of the timer
        $scope.humanizeDurationTimer = function(input, units) {
            // units is a string with possible values of y, M, w, d, h, m, s, ms
            if (input == 0) {
                return 0;
            } else {
                var duration = moment().startOf('day').add(input, units);
                var format = "";
                if (duration.hour() > 0) {
                    format += "H[h] ";
                }
                if (duration.minute() > 0) {
                    format += "m[m] ";
                }
                if (duration.second() > 0) {
                    format += "s[s] ";
                }
                return duration.format(format);
            }
        };

        $scope.startLesson = function(lesson_no) {
            $scope.step = 0;
            $scope.totalRepeat =0;
            QiGg_Lessions = [   {lesson: "0", step:  0, descr: "马步站桩", duration: 300},
                                {lesson: "1", step:  0, descr: "起势", duration: 10},
                                {lesson: "1", step:  1, descr: "马步站桩", duration: 300},
                                {lesson: "1", step:  2, descr: "右臂在上左臂在下，双臂平行", duration: 15},
                                {lesson: "1", step:  3, descr: "两小臂由内向外翻转", duration: 3},
                                {lesson: "1", step:  4, descr: "两手鱼际肌相对同时对准膻中穴", duration: 60},
                                {lesson: "1", step:  5, descr: "两小臂由内向外翻转", duration: 30},
                                {lesson: "1", step:  6, descr: "两手鱼际肌相对同时对准膻中穴", duration: 60},
                                {lesson: "1", step:  7, descr: "两臂往上推, 推至鱼际肌对准鼻尖", duration: 60},
                                {lesson: "1", step:  8, descr: "两手鱼际肌相对同时对准膻中穴", duration: 60},
                                {lesson: "1", step:  9, descr: "双臂往下沉，至中脘穴稍停", duration: 10},
                                {lesson: "1", step: 10, descr: "马步站桩式", duration: 60},
                                {lesson: "1", step: 11, descr: "左臂在上右臂在下，双臂平行", duration: 10},
                                {lesson: "1", step: 12, descr: "两小臂由内向外翻转", duration: 3},
                                {lesson: "1", step: 13, descr: "两手鱼际肌相对同时对准膻中穴", duration: 60},
                                {lesson: "1", step: 14, descr: "两小臂由内向外翻转", duration: 30},
                                {lesson: "1", step: 15, descr: "两手鱼际肌相对同时对准膻中穴", duration: 60},
                                {lesson: "1", step: 16, descr: "两臂往上推, 推至鱼际肌对准鼻尖", duration: 60},
                                {lesson: "1", step: 17, descr: "两手鱼际肌相对同时对准膻中穴", duration: 60},
                                {lesson: "1", step: 18, descr: "双臂往下沉，至中脘穴稍停", duration: 10},                                
                                {lesson: "1", step: 19, descr: "马步站桩式", duration: 300},
                                {lesson: "1", step: 20, descr: "<round#>", duration: 1, gotoStep:2, repeat:1, durationOverride:1, complete:0} ,                                
                                {lesson: "2", step:  0, descr: "起势",   duration: 10},
                                {lesson: "2", step:  1, descr: "站桩",   duration: 300},
                                {lesson: "2", step:  2, descr: "十字手", duration: 10},
                                {lesson: "2", step:  3, descr: "小球1",  duration: 30},
                                {lesson: "2", step:  4, descr: "大球2",  duration: 60},
                                {lesson: "2", step:  5, descr: "小球3",  duration: 30},
                                {lesson: "2", step:  6, descr: "大球4",  duration: 60},
                                {lesson: "2", step:  7, descr: "小球5",  duration: 30},
                                {lesson: "2", step:  8, descr: "大球6",  duration: 60},
                                {lesson: "2", step:  9, descr: "小球7",  duration: 30},
                                {lesson: "2", step: 10, descr: "转站桩", duration: 5},
                                {lesson: "2", step: 11, descr: "站桩",   duration: 60},
                                {lesson: "2", step: 12, descr: "十字手", duration: 10},
                                {lesson: "2", step: 13, descr: "小球1",  duration: 30},
                                {lesson: "2", step: 14, descr: "大球2",  duration: 60},
                                {lesson: "2", step: 15, descr: "小球3",  duration: 30},
                                {lesson: "2", step: 16, descr: "大球4",  duration: 60},
                                {lesson: "2", step: 17, descr: "小球5",  duration: 30},
                                {lesson: "2", step: 18, descr: "大球6",  duration: 60},
                                {lesson: "2", step: 19, descr: "小球7",  duration: 30},
                                {lesson: "2", step: 20, descr: "转站桩", duration: 5},                                                     
                                {lesson: "2", step: 21, descr: "站桩",   duration: 300},
                                {lesson: "2", step: 22, descr: "<round#>", duration: 1, gotoStep:2, repeat:1, durationOverride:300, complete:0},                                     
                                {lesson: "3", step:  0, descr: "起势",   duration: 15},
                                {lesson: "3", step:  1, descr: "站桩",   duration: 300},                                
                                {lesson: "3", step:  2, descr: "2 食指扳上",  duration: 60},
                                {lesson: "3", step:  3, descr: "4 无名指扳下",duration: 60},
                                {lesson: "3", step:  4, descr: "1 大拇指扳下",duration: 60},
                                {lesson: "3", step:  5, descr: "5 尾指扳下", duration:  60},
                                {lesson: "3", step:  6, descr: "3 中指扳下", duration:  60},                                                   
                                {lesson: "3", step:  7, descr: "<round#>", duration: 1, gotoStep:2, repeat:4, durationOverride:1, complete:0},
                                {lesson: "3", step:  8, descr: "站桩", duration: 300},
                                {lesson: "4", step:  0, descr: "马步站桩", duration: 300},
                                {lesson: "4", step:  1, descr: "起势", duration: 10},
                                {lesson: "4", step:  2, descr: "站桩", duration: 300}

                            ];            
            curr_lesson = [];

            switch (lesson_no) {
                case 0:
                    $scope.lessonTitle="马步站桩";
                    break;
                case 1:
                    $scope.lessonTitle="双臂揽月";
                    break;
                case 2:
                    $scope.lessonTitle="双臂抱球";
                    break;
                case 3:
                    $scope.lessonTitle="扶正益寿";
                    break;
                case 4:
                    $scope.lessonTitle="滚球法";
                    break;
            };

            // console.log(lesson_no);

            for (var i = 0; i < QiGg_Lessions.length; i++) {
                if (QiGg_Lessions[i].lesson == lesson_no) {
                   curr_lesson.push(QiGg_Lessions[i]); 
                };
                
            };

            $scope.TotalSteps = curr_lesson.length;            
            $scope.selectTimer(curr_lesson[$scope.step].duration);
            $scope.lesson = lesson_no;
        };
        
        $scope.getDescr = function() {

            if ($scope.step < curr_lesson.length) {
                var ls_desc = "";
                
                ls_desc = curr_lesson[$scope.step].descr;
                if (ls_desc == "<round#>") {
                  ls_desc = "第" + $scope.totalRepeat.toString() + "遍";
                }
                return ls_desc;    
            } else {
                return "";
            }
            
        };
        // function for the modal
        $ionicModal.fromTemplateUrl('templates/timer.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;
        });
});

