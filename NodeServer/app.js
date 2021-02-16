const io = require('socket.io')(3004);

var mysql = require('mysql');
var dbconfig = require('./dbconfig.js');
//var connection = mysql.createConnection(dbconfig);
var connection = null;
var mkdirp = require('mkdirp');
var fs = require('fs');


function startConnection() {
    connection = mysql.createConnection(dbconfig);
    connection.connect(function(err) {
        if (err) {
            startConnection();
        }
    });
    connection.on('error', function(err) {
        if (err.fatal)
            startConnection();
    });
}

startConnection();


io.on('connection', socket => {
    var client_ip;
    socket.on('TIZEN', function (data) {
        client_ip = data;
        console.log(client_ip + ' connect');
        socket.emit('SUCCESS', 'success');
    });

    socket.on('SensorValue', (data, callback) => {
        startConnection();
		handleData(data);
	connection.end();
    });

    socket.on('nonTransmitData', (data, callback) => {
        startConnection();
		//handleData(data);	
        if(data != null){
            let parseData = data.split('\n');
            parseData.pop();
            if(parseData[0] != null){
                //console.log(parseData[0]);
		let dir = '../backupData/' + parseData[0].split(',')[0].split(' ')[0] + '/' + parseData[0].split(',')[2] + '_' + parseData[0].split(',')[4] + '/';
                var writeValue = '';
                var historyQuery = 'INSERT INTO tb_history(file_name,duid,name,age,gender,transDate,regData) VALUES(?,?,?,?,?,?,now())'
                parseData.forEach(row => {
                    var col = row.split(',');
                    var query = 'INSERT INTO tb_watch_sensor_value(usr_name,usr_age,usr_gender,usr_height,usr_weight,step_status,speed,walk_step,run_step,total_step,hrm,rr,hrm_green,gyro_x,gyro_y,gyro_z,check_time,`timestamp`,accel_x,accel_y,accel_z,lux,sleep_status,sleep_timestamp,duid) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
                    var sensorVal = [
                        col[2]      //usr_name
                        , col[3]    //usr_age
                        , col[4]    //usr_gender
                        , col[5]    //usr_height
                        , col[6]    //usr_weight
                        , col[8]    //step_status
                        , col[9]    //speed
                        , col[10]    //walk_step
                        , col[11]   //run_step
                        , col[12]   //total_step
                        , col[20]   //hrm
                        , col[21]   //rr
			, col[22]   //hrm_green
			, col[14]   //gyro_x
                        , col[15]   //gyro_y
                        , col[16]   //gyro_z
                        , col[0]    //check_time
			, col[1]    //timestamp			
                        , col[17]   //accel_x
                        , col[18]   //accel_y
                        , col[19]   //accel_z
			, col[23]   //lux
                        , col[24]   //sleep_status
                        , col[25]   //sleep_timestamp
                        , col[26]   //duid
                    ];
                    
                    writeValue += col[0] + ',' +
                                    col[1] + ',' +
                                    col[2] + ',' +
                                    col[3] + ',' +
                                    col[4] + ',' +
                                    col[5] + ',' +
                                    col[6] + ',' +
                                    col[7] + ',' +
                                    col[8] + ',' +
                                    col[9] + ',' +
                                    col[10] + ',' +
                                    col[11] + ',' +
                                    col[12] + ',' +
                                    col[13] + ',' +
                                    col[14] + ',' +
                                    col[15] + ',' +
                                    col[16] + ',' +
                                    col[17] + ',' +
                                    col[18] + ',' +
                                    col[19] + ',' +
                                    col[20] + ',' +
                                    col[21] + ',' +
                                    col[22] + ',' +
                                    col[23] + ',' +
				    col[24] + ',' +
				    col[25] + ',' +
                                    col[26] + '\n'
                    connection.query(query, sensorVal, function (err) {
                        if (err) console.log(err);
                    });
                    
                });
                var historyVal = [
                    parseData[0].split(',')[2] + '_' + parseData[0].split(',')[4] + '_' + parseData[0].split(',')[0] + '.csv'
                    ,  parseData[0].split(',')[26]
                    ,  parseData[0].split(',')[2]
                    ,  parseData[0].split(',')[3]
                    ,  parseData[0].split(',')[4]
                    ,  parseData[0].split(',')[0]
                ];
                connection.query(historyQuery, historyVal, function (err) {
                    if (err) console.log(err);
                });
                
                
                
                console.log(parseData[0].split(',')[0] + ' >> ' + parseData[0].split(',')[2] + ' nonTransData OK');
        
                mkdirp(dir, function (err) {
                    if (err) console.log(err);
                })
        
                fs.writeFile(dir + parseData[0].split(',')[2] + '_' + parseData[0].split(',')[4] + '_' + parseData[0].split(',')[0] + '.csv', writeValue, 'utf-8', (err)=>{
                    if (err) console.log(err)
                });
		
		connection.end();
            }
        }
    });

    socket.on('disconnect', () => {
        socket.emit('DISCONN');
    });
    socket.on('client_discon', (data) => {
        console.log(data + ' disconnected....');
    });

});

handleData = (data) => {
    let dir = '../backupData/' + data[0].time.timeValue.split(' ')[0] + '/' + data[0].userInfo.name + '_' + data[0].userInfo.gender + '/';
    var writeValue = '';
    var historyQuery = 'INSERT INTO tb_history(file_name,duid,name,age,gender,transDate,regData) VALUES(?,?,?,?,?,?,now())'
    for (var i = 0; i < data.length; i++) {
        var query = 'INSERT INTO tb_watch_sensor_value(usr_name,usr_age,usr_gender,usr_height,usr_weight,step_status,speed,walk_step,run_step,total_step,hrm,rr,hrm_green,gyro_x,gyro_y,gyro_z,check_time,`timestamp`,accel_x,accel_y,accel_z,lux,sleep_status,sleep_timestamp,duid) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        var sensorVal = [
            data[i].userInfo.name
            , data[i].userInfo.age
            , data[i].userInfo.gender
            , data[i].userInfo.height
            , data[i].userInfo.weight
            , data[i].pedometer.step
            , data[i].pedometer.speed
            , data[i].pedometer.walkStep
            , data[i].pedometer.runStep
            , data[i].pedometer.totalStep
            , data[i].hrm.hr
            , data[i].hrm.rr
	    , data[i].hrm.hrm_green
            , data[i].gyro.x
            , data[i].gyro.y
            , data[i].gyro.z
            , data[i].time.timeValue
	    , data[i].time.timestamp
            , data[i].accel.x
            , data[i].accel.y
            , data[i].accel.z
            , data[i].light.lux
            , data[i].sleepStatus.status
            , data[i].sleepStatus.timestamp
            , data[i].clientInfo.duid
        ];
        writeValue += data[i].time.timeValue + ',' +
			data[i].time.timestamp + ',' +
                        data[i].userInfo.name + ',' +
                        data[i].userInfo.age + ',' +
                        data[i].userInfo.gender + ',' +
                        data[i].userInfo.height + ',' +
                        data[i].userInfo.weight + ',' +
                        data[i].userInfo.birthDate + ',' +
                        data[i].pedometer.step + ',' +
                        data[i].pedometer.speed + ',' +
                        data[i].pedometer.walkStep + ',' +
                        data[i].pedometer.runStep + ',' +
                        data[i].pedometer.totalStep + ',' +
                        data[i].pedometer.calorie + ',' +			
                        data[i].gyro.x + ',' +
                        data[i].gyro.y + ',' +
                        data[i].gyro.z + ',' +
                        data[i].accel.x + ',' +
                        data[i].accel.y + ',' +
                        data[i].accel.z + ',' +
                        data[i].hrm.hr + ',' +
                        data[i].hrm.rr + ',' +
			data[i].hrm.hrm_green + ',' +
                        data[i].light.lux + ',' +
                        data[i].sleepStatus.status + ',' +
                        data[i].sleepStatus.timestamp +  ',' +
                        data[i].clientInfo.duid + '\n'

        connection.query(query, sensorVal, function (err) {
            if (err) console.log(err);
        });
    }
    console.log(data[0].time.timeValue + ' >> ' + data[0].userInfo.name + ' data OK');
    var historyVal = [
        data[0].userInfo.name + '_' + data[0].userInfo.gender + '_' + data[0].time.noParseTimeValue + '.csv'
        ,  data[0].clientInfo.duid
        ,  data[0].userInfo.name
        ,  data[0].userInfo.age
        ,  data[0].userInfo.gender
        ,  data[0].time.timeValue
    ];
    connection.query(historyQuery, historyVal, function (err) {
        if (err) console.log(err);
    });
    mkdirp(dir, function (err) {
        if (err) console.log(err);
    })

    fs.writeFile(dir + data[0].userInfo.name + '_' + data[0].userInfo.gender + '_' + data[0].time.timeValue + '.csv', writeValue, 'utf-8', (err) =>{
        if (err) console.log(err)
    });
}




