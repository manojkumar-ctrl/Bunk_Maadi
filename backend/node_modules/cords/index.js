_direction = function ( startPosition , directionPosition ){
	var result = 0;

	if(/*directionPosition&&startPosition&&directionPosition.x&&startPosition.x&&startPosition.y&&directionPosition.y&&*/Math.sqrt(Math.pow(directionPosition.x-startPosition.x,2)+Math.pow(directionPosition.y-startPosition.y,2))!=0){
		result = Math.acos((directionPosition.x-startPosition.x)/Math.sqrt(Math.pow(directionPosition.x-startPosition.x,2)+Math.pow(directionPosition.y-startPosition.y,2)));
		var sin=(directionPosition.y-startPosition.y)/Math.sqrt(Math.pow(directionPosition.x-startPosition.x,2)+Math.pow(directionPosition.y-startPosition.y,2));
		if(sin<0) result = -result;
	}
	return result;
}
_moveIndirection = function ( position , direction , distance ){
	if(!isNaN(Math.cos(direction)*distance)) position.x = position.x + Math.cos(direction)*distance;
	if(!isNaN(Math.sin(direction)*distance)) position.y = position.y + Math.sin(direction)*distance;
	return position;
}
_distance = function ( position1 , position2 ){
	return Math.sqrt(Math.pow(position2.x-position1.x,2)+Math.pow(position2.y-position1.y,2));
}
var cord = {
	direction : _direction,
	moveIndirection : _moveIndirection,
	distance : _distance
}
if (typeof(module) !== 'undefined') module.exports = cord;