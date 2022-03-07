import { Sandbox, SandboxOptions, SandboxPlayer } from "ZEPETO.Multiplay";
import { DataStorage } from "ZEPETO.Multiplay.DataStorage";
import { Player, Transform, Vector3 } from "ZEPETO.Multiplay.Schema";

export default class extends Sandbox {

    private playerCount: number;

    private gameStartFlag: boolean;
    private gameOpeningFlag: boolean;
    private gameFlag: boolean;
    private playerFlag: boolean;
    private endingFlag: boolean;

    private timerDelay: number;
    private gameStartDelay: number;
    private gameOpeningDelay: number;
    private itemDelay: number;
    private endingDelay: number;
    private slowPadDelay: number;

    private timer: number;

    private playerScoreMap: Map<string, number> = new Map<string, number>();
    private playerArr: string[];
    private scoreArr: number[];

    private openingPlayer: number;

    private gameOverCount: number;

    private itemCycle: number;

    constructor() {
        super();
    }

    onCreate(options: SandboxOptions) {

        // Room 객체가 생성될 때 호출됩니다.
        // Room 객체의 상태나 데이터 초기화를 처리 한다.

        this.playerCount = 0;
        this.gameStartFlag = false;
        this.gameOpeningFlag = false;
        this.gameFlag = false;
        this.playerFlag = true;
        this.endingFlag = false;
        this.timerDelay = 0;
        this.itemDelay = 0;
        this.endingDelay = 0;
        this.gameStartDelay = 0;
        this.gameOpeningDelay = 0;
        this.slowPadDelay = 0;
        this.timer = 1;
        this.openingPlayer = 0;
        this.gameOverCount = 0;
        this.itemCycle = 4;

        this.playerArr = [];
        this.scoreArr = [];

        this.onMessage("onChangedTransform", (client, message) => {
            const player = this.state.players.get(client.sessionId);

            const transform = new Transform();
            transform.position = new Vector3();
            transform.position.x = message.position.x;
            transform.position.y = message.position.y;
            transform.position.z = message.position.z;

            transform.rotation = new Vector3();
            transform.rotation.x = message.rotation.x;
            transform.rotation.y = message.rotation.y;
            transform.rotation.z = message.rotation.z;

            player.transform = transform;
        });

        this.onMessage("onChangedState", (client, message) => {
            const player = this.state.players.get(client.sessionId);
            player.state = message.state;
        });

        this.onMessage("deleteItemServer", (client, message) => { // 아이템 삭제 수신
            this.broadcast("deleteItemClient", message);
        });

        this.onMessage<string>("setScore", (client, message) => {
            var messageArr = message.toString().split('/');
            this.playerScoreMap.set(messageArr[0], parseInt(messageArr[1]));
            this.playerScoreMap = new Map([...this.playerScoreMap.entries()].sort((a, b) => b[1] - a[1]));

            this.playerArr = [];
            this.scoreArr = [];

            for (const [key, values] of this.playerScoreMap) {
                this.playerArr.push(key);
                this.scoreArr.push(values);
            }

            this.broadcast("playerRank", this.playerArr);
            this.broadcast("totalScore", this.scoreArr);
        });

        this.onMessage("chooseWinner", (client, message) => { //게임 종료 후 점수 계산 메세지 수신
            this.gameOverCount++;

            if (this.playerCount == this.gameOverCount) {
                var max = Math.max.apply(null, this.scoreArr);
                var index = this.scoreArr.indexOf(max);
                var winner = this.playerArr[index];

                var arr = this.scoreArr.filter(score => score == max);

                if (arr.length == 1) { //공동 우승자가 없다면
                    this.broadcast("winner", winner);
                } else { //공동 우승자가 있다면
                    this.broadcast("nonWinner", "");
                }

                this.endingFlag = true;
                this.gameOverCount = 0;
            }
        });

        this.onMessage("openingFinish", (client, message) => { //오프닝 종료 메세지 수신
            this.openingPlayer++;
            if (this.openingPlayer == this.playerCount) {
                this.broadcast("openingFinish", "");
                this.gameOpeningFlag = true;
            }
        });
    }

    async onJoin(client: SandboxPlayer) {

        // schemas.json 에서 정의한 player 객체를 생성 후 초기값 설정.
        console.log(`[OnJoin] sessionId : ${client.sessionId}, HashCode : ${client.hashCode}, userId : ${client.userId}`)

        // 입장 Player Storage Load
        const storage: DataStorage = client.loadDataStorage();

        const player = new Player();
        player.sessionId = client.sessionId;

        if (client.hashCode) {
            player.zepetoHash = client.hashCode;
        }
        if (client.userId) {
            player.zepetoUserId = client.userId;
        }

        // storage에 입장 유저의 transform이 존재하는 지 확인한 다음, 갱신합니다.
        const raw_val = await storage.get("transform") as string;
        const json_val = raw_val != null ? JSON.parse(raw_val) : JSON.parse("{}");

        const transform = new Transform();
        transform.position = new Vector3();
        transform.rotation = new Vector3();

        if (json_val.position) {
            transform.position.x = json_val.position.x;
            transform.position.y = json_val.position.y;
            transform.position.z = json_val.position.z;
        }

        if (json_val.rotation) {
            transform.rotation.x = json_val.rotation.x;
            transform.rotation.y = json_val.rotation.y;
            transform.rotation.z = json_val.rotation.z;
        }

        player.transform = transform;

        // client 객체의 고유 키값인 sessionId 를 사용해서 유져 객체를 관리.
        // set 으로 추가된 player 객체에 대한 정보를 클라이언트에서는 players 객체에 add_OnAdd 이벤트를 추가하여 확인 할 수 있음.
        this.state.players.set(client.sessionId, player);

        this.playerScoreMap.set(client.userId, 0);

        if (this.playerFlag) {
            this.playerCount++;

            if (this.playerCount >= 5) { //인원 5명이 채워지면 게임 시작
                this.gameStartFlag = true;
                await this.lock();
            }
        }
    }

    getTimeSandbox() {
        return Date.now();
    }

    onTick(deltaTime: number): void {
        //  서버에서 설정된 타임마다 반복적으로 호출되며 deltaTime 을 이용하여 일정한 interval 이벤트를 관리할 수 있음.
        if (this.gameStartFlag) { //게임 시작 전 타이머
            this.gameStartDelay += deltaTime;

            if (this.gameStartDelay > 1000) {
                this.gameStartDelay -= 1000;
                this.timer++;

                if (this.timer == 7) {
                    this.broadcast("openingStart", "");
                    this.gameStartFlag = false;
                    this.timer = 1;
                }
            }
        }

        if (this.gameOpeningFlag) { //오프닝 종료 후, 게임 시작 전 타이머
            this.gameOpeningDelay += deltaTime;

            if (this.gameOpeningDelay > 1000) {
                this.gameOpeningDelay -= 1000;
                this.timer++;

                if (this.timer == 5) {
                    this.playerArr = [];
                    this.scoreArr = [];

                    for (const [key, values] of this.playerScoreMap) {
                        this.playerArr.push(key);
                        this.scoreArr.push(values);
                    }

                    this.broadcast("gameStart", this.playerArr);
                    for (let i = 0; i < 30; i++) {
                        this.CreateItemCoordinates();
                    }

                    this.gameFlag = true;
                    this.playerFlag = false;

                    this.gameOpeningFlag = false;
                    this.timer = 1;
                }
            }
        }

        if (this.gameFlag) {
            this.timerDelay += deltaTime;
            this.itemDelay += deltaTime;
            this.slowPadDelay += deltaTime;

            //1초마다 실행
            if (this.timerDelay > 1000) { //게임 플레이 타이머
                this.timerDelay -= 1000;
                this.broadcast("timer", this.timer);
                this.timer++;

                if(this.timer == 90) {
                    this.itemCycle = 5;
                }

                if (this.timer == 122) {
                    this.broadcast("gameOver", "");
                    this.gameFlag = false;
                    this.timer = 1;
                }
            }

            //2초마다 실행
            if (this.itemDelay > 2000) { //아이템 생성 타이머
                this.itemDelay -= 2000;

                for(let i=0; i<this.itemCycle; i++) {
                    this.CreateItemCoordinates();
                }
            }

            //5초마다 실행
            if (this.slowPadDelay > 5000) { //슬로우 장판 무빙
                this.slowPadDelay -= 5000;

                this.slowPadCoordinates();
            }
        }

        if (this.endingFlag) {
            this.endingDelay += deltaTime;

            if (this.endingDelay > 1000) {
                this.endingDelay -= 1000;
                this.timer++;

                if (this.timer == 10) {
                    this.broadcast("endingFinish", "");
                    this.endingFlag = false;
                    this.timer = 1;
                }
            }
        }
    }

    async onLeave(client: SandboxPlayer, consented?: boolean) {

        // 퇴장 Player Storage Load
        const storage: DataStorage = client.loadDataStorage();

        const _player = this.state.players.get(client.sessionId);
        const _pos = _player.transform.position;
        const _rot = _player.transform.rotation;

        const _trans = {
            position: { x: _pos.x, y: _pos.y, z: _pos.z },
            rotation: { x: _rot.x, y: _rot.y, z: _rot.z }
        };

        // console.log(`[onLeave] last transform : ${JSON.stringify(_trans)}`);
        // 퇴장하는 유저의 transform을 json 형태로 저장한 다음, 재접속 시 load 합니다.
        await storage.set("transform", JSON.stringify(_trans));

        // allowReconnection 설정을 통해 순단에 대한 connection 유지 처리등을 할 수 있으나 기본 가이드에서는 즉시 정리.
        // delete 된 player 객체에 대한 정보를 클라이언트에서는 players 객체에 add_OnRemove 이벤트를 추가하여 확인 할 수 있음.
        this.state.players.delete(client.sessionId);

        this.playerCount--;

        this.playerScoreMap.delete(client.userId);
    }

    public slowPadCoordinates() {
        //x좌표 -8~8, z좌표 -15~15
        var x1 = Math.floor(Math.random() * 8) + 1;
        var x_code1 = Math.floor(Math.random() * 2);
        var x_float1 = Math.floor(Math.random() * 10);
        if (x_code1 == 0) {
            x1 *= -1;
        }

        var x_str1 = x1.toString() + '.' + x_float1.toString();
        x1 = parseFloat(x_str1);

        var z1 = Math.floor(Math.random() * 15) + 1;
        var z_code1 = Math.floor(Math.random() * 2);
        var z_float1 = Math.floor(Math.random() * 10);
        if (z_code1 == 0) {
            z1 *= -1;
        }
        var z_str = z1.toString() + '.' + z_float1.toString();
        z1 = parseFloat(z_str);

        var x2 = Math.floor(Math.random() * 8) + 1;
        var x_code2 = Math.floor(Math.random() * 2);
        var x_float2 = Math.floor(Math.random() * 10);
        if (x_code2 == 0) {
            x2 *= -1;
        }

        var x_str2 = x2.toString() + '.' + x_float2.toString();
        x2 = parseFloat(x_str2);

        var z2 = Math.floor(Math.random() * 15) + 1;
        var z_code2 = Math.floor(Math.random() * 2);
        var z_float2 = Math.floor(Math.random() * 10);
        if (z_code2 == 0) {
            z2 *= -1;
        }
        var z_str2 = z2.toString() + '.' + z_float2.toString();
        z2 = parseFloat(z_str2);

        this.broadcast("slowPadMoving", x1 + "/" + z1 + "/" + x2 + "/" + z2);
    }

    public CreateItemCoordinates() {
        //x좌표 -8~8, z좌표 -15~15
        var x = Math.floor(Math.random() * 8) + 1;
        var x_code = Math.floor(Math.random() * 2);
        var x_float = Math.floor(Math.random() * 10);
        if (x_code == 0) {
            x *= -1;
        }

        var x_str = x.toString() + '.' + x_float.toString();
        x = parseFloat(x_str);

        var z = Math.floor(Math.random() * 15) + 1;
        var z_code = Math.floor(Math.random() * 2);
        var z_float = Math.floor(Math.random() * 10);
        if (z_code == 0) {
            z *= -1;
        }
        var z_str = z.toString() + '.' + z_float.toString();
        z = parseFloat(z_str);

        this.broadcast("createItem", x + "/" + z);
    }
    
    public PlayerScoreSetting() {
        this.scoreArr = [];
        this.playerArr = [];

        for (const [key, values] of this.playerScoreMap) {
            this.playerArr.push(key);
            this.scoreArr.push(values);
        }

        this.broadcast("playerRank", this.playerArr);
        this.broadcast("totalScore", this.scoreArr);
    }
}