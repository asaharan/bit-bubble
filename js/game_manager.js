function handleNewGame(){
    ga('send', 'event', {
        eventCategory: 'Game',
        eventAction: 'New game',
        eventLabel:size,
      });
}
function handleRestartGame(){
    ga('send', 'event', {
        eventCategory: 'Game',
        eventAction: 'Restart',
        eventLabel:size,
      });
    handleNewGame();
}
function GameManager(gridManager,styleSheetManager,bitManager,masterLogic){
    this.gridManager=new gridManager;
    this.styleSheetManager=new styleSheetManager;
    this.bitManager=new bitManager;
    this.masterLogic=new masterLogic;
    this.init();
    this.xbitManager=bitManager;
    this.xgridManager=gridManager;
    window.scoreManager = new Score();
    handleNewGame();
}
GameManager.prototype.init= function () {
    console.log(document.querySelector('.tryAgain'));
    document.querySelector('.newGame').addEventListener('click',this.restart.bind(this));
    document.querySelector('.tryAgain').addEventListener('click',this.restart.bind(this));
    this.gridManager.on('tileClick',this.play.bind(this));
    this.bitManager.on('mergeComplete',this.onMerge.bind(this));
};
GameManager.prototype.restart= function () {
    scoreManager = new Score();
    document.getElementById('gameOverContainer').setAttribute('class','gameOver');
    var self=this;
    self.gridManager=null;
    self.bitManager=null;
    this.styleSheetManager.setup();
    document.querySelector('.mainGrid').innerHTML='';
    window.requestAnimationFrame(function(){
        self.gridManager=new self.xgridManager;
        self.bitManager=new self.xbitManager;
        self.gridManager.on('tileClick',self.play.bind(self));
        self.bitManager.on('mergeComplete',self.onMerge.bind(self));
    });
    handleRestartGame();
};
GameManager.prototype.play=function(clickedTile){
    var self=this;
    clickedTile.isVisible=false;
    var availableDirections=this.masterLogic.directions(clickedTile.position());
    if(availableDirections){
        var scoreOfBit=parseInt(clickedTile.value/availableDirections.length);
        availableDirections.forEach(function (direction) {
            var nextTile=self.gridManager.findNextTile(clickedTile.position(),direction);
            if(nextTile!=null){
                self.bitManager.moveBit(direction,clickedTile.position(),nextTile.position(),scoreOfBit);
            }else{
                console.log('next tile not found for ',direction,directions);
                self.bitManager.moveBit(direction,clickedTile.position(),clickedTile.position(),scoreOfBit,true);
            }
        });
    }
    this.gridManager.applyChanges();
};
GameManager.prototype.onMerge= function (mergeDetails) {//this will called from bit manager when bit animation is over
    //console.log('bit animation over and merge details are: ',mergeDetails,'now it should be updated now')
    var tileToBeUpdated=this.gridManager.findTileByPosition(mergeDetails.position);
    tileToBeUpdated.nextValue=tileToBeUpdated.value+mergeDetails.valueTobeAdded;
    this.gridManager.applyChanges();
    scoreManager.updateScore(this.gridManager.currentScore());
    if(this.gridManager.isGameOver()){
        //Game Over
        setTimeout(function(){
            document.getElementById('gameOverContainer').setAttribute('class','gameOver open');
        },300);
    }

};

function Score(){
    this.defaultScore = 512;
    this.localStorageBestScoreName = 'bit-bubble-high-score-object';
    this.size = size;
    this.currentScoreHTMLNode = document.querySelector('.currentScore');
    this.bestScoreHTMLNode = document.querySelector('.bestScore');
    this.currentScore = this.defaultScore;
    this.max = window.localStorage.getItem('bit-bubble-high-score') || 512;
    this.max = this.getBestScore();
    this.applyChanges();
}
Score.prototype.getBestScore = function(size){
    size = size || this.size;
    var v = JSON.parse(window.localStorage.getItem(this.localStorageBestScoreName));
    if(v==null){
        return this.defaultScore;
    }
    return v[size] || this.defaultScore;
}
Score.prototype.setBestScore = function(max,size){
    max = max || this.max;
    size = size || this.size;
    var v = JSON.parse(window.localStorage.getItem(this.localStorageBestScoreName));
    if(v==null){
        v={};
    }
    v[size] = max;
    window.localStorage.setItem(this.localStorageBestScoreName, JSON.stringify(v));
}
Score.prototype.updateScore = function(currentScore){
    if(typeof currentScore != 'number'){
        return;
    }
    this.currentScore = currentScore;
    if(this.max < this.currentScore){
        this.max = this.currentScore;
        // window.localStorage.setItem('bit-bubble-high-score',this.max);
        //apply changed to bestScore
        this.setBestScore();
    }
    this.applyChanges();
}
Score.prototype.applyChanges = function(){
    this.bestScoreHTMLNode.innerHTML = this.max;
    this.currentScoreHTMLNode.innerHTML = this.currentScore;

    //apply changed to currentScore
}