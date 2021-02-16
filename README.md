# sleepProject
갤럭시 워치 수집 어플리케이션(Tizen OS) &amp; 수집모듈(Node.js)

---------------------------------------
## 데이터 수집 모듈
1. 수집 모듈 기능
    - 스마트워치에서 센싱 데이터를 Tizen App에 insert하여 데이터를 수집합니다
    - 와이파이가 연결이 안된 스마트 워치에서 수집된 미전송 데이터를 디바이스 내부에 저장한 뒤 무선 통신이 연결된 후 적제된 데이터를 재전송 합니다.
    -일자별 데이터를 csv파일로 백업 시킵니다.

2. SocketConnection
    ``` javascript
    io.on('connection', socket => {
        var client_ip;
        socket.on('TIZEN', function (data) {
            client_ip = data;
            console.log(client_ip + ' connect');
            socket.emit('SUCCESS', 'success');
        });
    }
    ```
3. DataInsert
    ``` javascript
    handleData = (data) => {
        let dir = '../backupData/' + data[0].time.timeValue.split(' ')[0] + '/' + data[0].userInfo.name + '_' + data[0].userInfo.gender + '/';
        var writeValue = '';
        var historyQuery = 'INSERT INTO tb_history(file_name,duid,name,age,gender,transDate,regData) VALUES(?,?,?,?,?,?,now())'
        for (var i = 0; i < data.length; i++) {
            var query = 'INSERT INTO tb_watch_sensor_value(usr_name,usr_age,usr_gender,usr_height,usr_weight,step_status,speed,walk_step,run_step,total_step,hrm,rr,hrm_green,gyro_x,gyro_y,gyro_z,check_time,timestamp,accel_x,accel_y,accel_z,lux,sleep_status,sleep_timestamp,duid) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
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
    ```
4. DBConfig
    ``` javascript
     module.exports = {
        host : '***.***.***.***',
        user : '*******',
        password : '************',
        port : 3306,
        database : '********',
        connectionLimit : 30
    }  
    ```

--------------------------------

## Tizen 수집 앱
1. 앱 작동
    1. 서버연결
        - 수집 앱을 켜서 홈 메뉴에 있는 서버 연결을 클립합니다.
        - 서버 연결을 클릭해서 서버 접속 정보에 관련된 IP 및 PORT 번호를 수정합니다.
        - 데이터 서버 전송 주기를 설정합니다.
    2. 센서 측정
        - 센서 측정 버튼을 눌러 센서 데이터를 수집하게 됩니다.
    3. 사용자 정보 입력
        - 사용자의 키, 몸무게 등 설정하고 수치를 입력하는 화면의 경우 드래그와 베젤의 움직으로 이동이 가능합니다
    4. 보관 주기 설정
        - 수집된 데이터의 주기를 설정할 수 있습니다. 보관 주기의 경우 '2주, 1개월,2개월,3개월'로 설정할 수 있게 됩니다.
        - 보관되어 있는 데이터는 전체 삭제가 가능합니다.