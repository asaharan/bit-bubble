/**
 * Created by amitkum on 20/7/15.
 */
function MasterLogic(){
    this.size=size;
}
MasterLogic.prototype.findAllDirections= function (position) {
    console.log(this.directions(position));
};
MasterLogic.prototype.directions= function (tile) {
    var corner=this.isCorner(tile);//corner has directions in which tiles has to be fired
    if(corner){
        return corner;
    }
    var center=this.isCenter(tile);
    if(center){
        return center;
    }
    return this.isEdge(tile);
};
MasterLogic.prototype.isCorner= function (tile) {
    if(tile.x==0&&tile.y==0){
        return [directions.right,directions.down];
    }
    if(tile.x==size-1&&tile.y==0){
        return [directions.left,directions.down];
    }
    if(tile.x==0&&tile.y==size-1){
        return [directions.right,directions.up];
    }
    if(tile.x==size-1&&tile.y==size-1){
        return [directions.left,directions.up];
    }
    return false;
};
MasterLogic.prototype.isCenter=function(tile){
    if(tile.x>0&&tile.x<size-1&&tile.y>0&&tile.y<size-1){
        return [directions.up,directions.right,directions.down,directions.left];
    }
    return false;
};
MasterLogic.prototype.isEdge= function (tile) {
    if(tile.x==0&&(tile.y>0&&tile.y<size-1)){//left edge
        return [directions.up,directions.right,directions.down];
    }
    if(tile.x==size-1&&(tile.y>0&&tile.y<size-1)){//right edge
        return [directions.up,directions.down,directions.left];
    }
    if(tile.y==0&&(tile.x>0&&tile.x<size-1)){//top edge
        return [directions.right,directions.down,directions.left];
    }
    if(tile.y==size-1&&(tile.x>0&&tile.x<size-1)){//bottom edge
        return [directions.up, directions.right, directions.left];
    }
};