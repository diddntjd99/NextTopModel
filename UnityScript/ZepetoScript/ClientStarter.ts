import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldHelper, ZepetoWorldMultiplay } from 'ZEPETO.World'
import { Room, RoomData } from 'ZEPETO.Multiplay'
import { Player, State, Vector3 } from 'ZEPETO.Multiplay.Schema'
import { CharacterState, SpawnInfo, ZepetoPlayers, ZepetoPlayer } from 'ZEPETO.Character.Controller'
import { Text, Image, Button } from 'UnityEngine.UI'
import { AudioSource, AudioClip } from 'UnityEngine'
import * as UnityEngine from "UnityEngine";

export default class Starter extends ZepetoScriptBehaviour {

    public multiplay: ZepetoWorldMultiplay;
    public timerUI: Text;
    public zepetoUI: UnityEngine.GameObject;
    public item: UnityEngine.GameObject[];
    public totalItem: UnityEngine.GameObject;
    public endingCamera: UnityEngine.GameObject;
    public openingToon: UnityEngine.GameObject;
    public openingCamera: UnityEngine.GameObject;
    public openingLight: UnityEngine.GameObject;
    public playerProfile: Image[];
    public socreUI: Text[];
    public panelBlackUI: UnityEngine.GameObject[];
    public panelPurpleUI: UnityEngine.GameObject[];
    public musicAudio: UnityEngine.GameObject;
    public voiceAudio: UnityEngine.GameObject;
    public countClip: AudioClip[];
    public slowPad1: UnityEngine.GameObject;
    public slowPad2: UnityEngine.GameObject;
    public slowPadGoal1: UnityEngine.GameObject;
    public slowPadGoal2: UnityEngine.GameObject;
    public winnerProfile: Image;
    public winnerBanner: UnityEngine.GameObject;

    public startImage: UnityEngine.GameObject;
    public endingImage: UnityEngine.GameObject;
    public feverTimeImage: UnityEngine.GameObject;
    public introductImage1: UnityEngine.GameObject;
    public exitBtn1: Button;
    public introductImage2: UnityEngine.GameObject;
    public exitBtn2: Button;
    public fadeImage: Image;

    public voiceClip: AudioClip[];
    public clappingClip: AudioClip;
    public endingMusic: AudioClip;

    public ui_1st: UnityEngine.GameObject;

    private room: Room;
    private currentPlayers: Map<string, Player> = new Map<string, Player>();

    private itemCount: number;
    private score: number;

    private playerId: string;
    private playerArr: string[];
    private scoreArr: number[];

    private musicAudioSource: AudioSource;
    private voiceAudioSource: AudioSource;

    private countFlag1: boolean;
    private countFlag2: boolean;
    private countFlag3: boolean;
    private countFlag4: boolean;
    private countFlag5: boolean;

    private gamestartFlag: boolean;
    private startTimer: number;
    private gameoverFlag: boolean;
    private endingTimer: number;

    private fevertimeVoiceFlag: boolean;

    private Start() {
        this.itemCount = 0;
        this.score = 0;
        this.playerArr = [];
        this.scoreArr = [];

        this.musicAudioSource = this.musicAudio.GetComponent<AudioSource>();
        this.voiceAudioSource = this.voiceAudio.GetComponent<AudioSource>();

        this.countFlag1 = true;
        this.countFlag2 = true;
        this.countFlag3 = true;
        this.countFlag4 = true;
        this.countFlag5 = true;

        this.gameoverFlag = false;
        this.endingTimer = 0;
        this.gamestartFlag = false;
        this.startTimer = 0;

        this.fevertimeVoiceFlag = true;

        this.exitBtn1.onClick.AddListener(() => this.exitFunction(this.introductImage1, this.exitBtn1));
        this.exitBtn2.onClick.AddListener(() => this.exitFunction(this.introductImage2, this.exitBtn2));

        this.multiplay.RoomCreated += (room: Room) => {
            this.room = room;

            this.room.AddMessageHandler("openingStart", (message) => {
                this.openingToon.gameObject.SetActive(true);
                this.openingCamera.gameObject.SetActive(true);
                this.openingLight.gameObject.SetActive(true);

                this.musicAudioSource.Play();

                this.zepetoUI.transform.GetChild(2).gameObject.SetActive(false);
                this.zepetoUI.transform.GetChild(4).gameObject.SetActive(false);
            });

            this.room.AddMessageHandler("openingFinish", (message) => {
                this.openingToon.gameObject.SetActive(false);
                this.openingCamera.gameObject.SetActive(false);
                this.openingLight.gameObject.SetActive(false);
                
                this.zepetoUI.transform.GetChild(2).gameObject.SetActive(true);
                this.zepetoUI.transform.GetChild(4).gameObject.SetActive(true);
                this.timerUI.gameObject.SetActive(true);

                this.introductImage1.gameObject.SetActive(true);
                this.exitBtn1.gameObject.SetActive(true);
                this.introductImage2.gameObject.SetActive(true);
                this.exitBtn2.gameObject.SetActive(true);
            });

            this.room.AddMessageHandler<string[]>("gameStart", (message) => {
                console.log("game start");

                this.voiceAudioSource.clip = this.voiceClip[0];
                this.voiceAudioSource.loop = false;
                this.voiceAudioSource.Play();

                this.startImage.gameObject.SetActive(true);
                this.gamestartFlag = true;

                this.slowPad1.gameObject.SetActive(true);
                this.slowPad2.gameObject.SetActive(true);

                this.playerArr = message;

                this.ui_1st.gameObject.SetActive(true);
                for (let i = 0; i < this.playerArr.length; i++) {
                    this.playerProfile[i].gameObject.SetActive(true);
                    this.socreUI[i].gameObject.SetActive(true);
                    
                    if(this.playerId == this.playerArr[i]){
                        this.panelBlackUI[i].gameObject.SetActive(false);
                        this.panelPurpleUI[i].gameObject.SetActive(true);
                    } else {
                        this.panelBlackUI[i].gameObject.SetActive(true);
                        this.panelPurpleUI[i].gameObject.SetActive(false);
                    }

                    ZepetoWorldHelper.GetProfileTexture(this.playerArr[i], (texture: UnityEngine.Texture) => {
                        this.playerProfile[i].sprite = this.GetSprite(texture);
                    }, (error) => {
                        console.log(error);
                    });
                }
            });

            this.room.AddMessageHandler("createItem", (message) => {
                var itemArr = message.toString().split('/');
                this.itemCount++;
                var v = new UnityEngine.Vector3(parseFloat(itemArr[0]), 0.5, parseFloat(itemArr[1]));

                var random = UnityEngine.Random.Range(1, 101);

                if (random <= 65) {
                    var copyItem = UnityEngine.GameObject.Instantiate(this.item[0], v, UnityEngine.Quaternion.identity) as UnityEngine.GameObject;
                } else if (random <= 90) {
                    var copyItem = UnityEngine.GameObject.Instantiate(this.item[1], v, UnityEngine.Quaternion.identity) as UnityEngine.GameObject;
                } else {
                    var copyItem = UnityEngine.GameObject.Instantiate(this.item[2], v, UnityEngine.Quaternion.identity) as UnityEngine.GameObject;
                }

                copyItem.name = this.itemCount.toString();
                copyItem.transform.SetParent(this.totalItem.transform);
            });

            this.room.AddMessageHandler("slowPadMoving", (message) => {
                var arr = message.toString().split('/');
                this.slowPadGoal1.transform.position = new UnityEngine.Vector3(parseFloat(arr[0]), 0.2, parseFloat(arr[1]));
                this.slowPadGoal2.transform.position = new UnityEngine.Vector3(parseFloat(arr[2]), 0.2, parseFloat(arr[3]));
            });

            this.room.AddMessageHandler<string>("timer", (message) => {
                if (parseInt(message) <= 50) {
                    this.timerUI.text = "01 : " + (60 - parseInt(message)).toString();
                } else if (parseInt(message) < 60) {
                    this.timerUI.text = "01 : 0" + (60 - parseInt(message)).toString();
                } else if (parseInt(message) == 60) {
                    this.timerUI.text = "01 : 00";
                } else if (parseInt(message) == 90) {
                    if (this.fevertimeVoiceFlag) {
                        this.voiceAudioSource.clip = this.voiceClip[1];
                        this.voiceAudioSource.loop = false;
                        this.voiceAudioSource.Play();
                        this.fevertimeVoiceFlag = false;
                    }
                    const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(this.room.SessionId);
                    zepetoPlayer.character.additionalRunSpeed += 3;
                    zepetoPlayer.character.additionalWalkSpeed += 3;

                    this.feverTimeImage.gameObject.SetActive(true);

                    this.timerUI.text = "00 : " + (60 - (parseInt(message) - 60)).toString();
                } else if (parseInt(message) <= 110) {
                    this.timerUI.text = "00 : " + (60 - (parseInt(message) - 60)).toString();
                } else {
                    this.timerUI.text = "00 : 0" + (60 - (parseInt(message) - 60)).toString();
                    if (60 - (parseInt(message) - 60) == 5) {
                        if (this.countFlag5) {
                            this.voiceAudioSource.clip = this.countClip[4];
                            this.voiceAudioSource.loop = false;
                            this.voiceAudioSource.Play();
                            this.countFlag5 = false;
                        }
                    } else if (60 - (parseInt(message) - 60) == 4) {
                        if (this.countFlag4) {
                            this.voiceAudioSource.clip = this.countClip[3];
                            this.voiceAudioSource.loop = false;
                            this.voiceAudioSource.Play();
                            this.countFlag4 = false;
                        }
                    } else if (60 - (parseInt(message) - 60) == 3) {
                        if (this.countFlag3) {
                            this.voiceAudioSource.clip = this.countClip[2];
                            this.voiceAudioSource.loop = false;
                            this.voiceAudioSource.Play();
                            this.countFlag3 = false;
                        }
                    } else if (60 - (parseInt(message) - 60) == 2) {
                        if (this.countFlag2) {
                            this.voiceAudioSource.clip = this.countClip[1];
                            this.voiceAudioSource.loop = false;
                            this.voiceAudioSource.Play();
                            this.countFlag2 = false;
                        }
                    } else if (60 - (parseInt(message) - 60) == 1) {
                        if (this.countFlag1) {
                            this.voiceAudioSource.clip = this.countClip[0];
                            this.voiceAudioSource.loop = false;
                            this.voiceAudioSource.Play();
                            this.countFlag1 = false;
                        }
                    }
                }
            });

            this.room.AddMessageHandler("gameOver", (message) => {
                console.log("game over");
                this.musicAudioSource.Stop();

                this.voiceAudioSource.clip = this.voiceClip[2];
                this.voiceAudioSource.loop = false;
                this.voiceAudioSource.Play();

                const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(this.room.SessionId);
                zepetoPlayer.character.additionalRunSpeed = 0;
                zepetoPlayer.character.additionalWalkSpeed = 0;
                zepetoPlayer.character.additionalJumpPower = 0;

                UnityEngine.GameObject.Destroy(this.totalItem);
                this.feverTimeImage.gameObject.SetActive(false);

                this.slowPad1.gameObject.SetActive(false);
                this.slowPad2.gameObject.SetActive(false);
                this.timerUI.gameObject.SetActive(false);

                this.endingImage.gameObject.SetActive(true);
                this.gameoverFlag = true;
            });

            this.room.AddMessageHandler("deleteItemClient", (message) => {
                UnityEngine.GameObject.Destroy(UnityEngine.GameObject.Find(message.toString()));
            });

            this.room.AddMessageHandler<string>("winner", (message) => {
                this.musicAudioSource.clip = this.endingMusic;
                this.musicAudioSource.volume = 1;
                this.musicAudioSource.loop = false;
                this.musicAudioSource.Play();

                this.voiceAudioSource.clip = this.clappingClip;
                this.voiceAudioSource.volume = 0.2;
                this.voiceAudioSource.loop = false;
                this.voiceAudioSource.Play();

                this.zepetoUI.transform.GetChild(2).gameObject.SetActive(false);
                this.zepetoUI.transform.GetChild(4).gameObject.SetActive(false);
                this.endingCamera.gameObject.SetActive(true);
                this.fadeImage.gameObject.SetActive(true);

                this.winnerBanner.gameObject.SetActive(true);
                this.winnerProfile.gameObject.SetActive(true);
                ZepetoWorldHelper.GetProfileTexture(message, (texture: UnityEngine.Texture) => {
                    this.winnerProfile.sprite = this.GetSprite(texture);
                }, (error) => {
                    console.log(error);
                });
            });

            this.room.AddMessageHandler("nonWinner", (message) => {
                console.log("non-winner");
                this.musicAudioSource.clip = this.endingMusic;
                this.musicAudioSource.volume = 1;
                this.musicAudioSource.loop = false;
                this.musicAudioSource.Play();

                this.zepetoUI.transform.GetChild(2).gameObject.SetActive(false);
                this.zepetoUI.transform.GetChild(4).gameObject.SetActive(false);
                this.endingCamera.gameObject.SetActive(true);
                this.fadeImage.gameObject.SetActive(true);
            });

            this.room.AddMessageHandler("endingFinish", (message) => {
                this.voiceAudioSource.Stop();

                this.zepetoUI.transform.GetChild(2).gameObject.SetActive(true);
                this.zepetoUI.transform.GetChild(4).gameObject.SetActive(true);
                this.endingCamera.gameObject.SetActive(false);

                this.winnerBanner.gameObject.SetActive(false);
                this.winnerProfile.gameObject.SetActive(false);

                this.fadeImage.gameObject.SetActive(false);

                this.ui_1st.gameObject.SetActive(false);
                for (let i = 0; i < 5; i++) {
                    this.playerProfile[i].gameObject.SetActive(false);
                    this.socreUI[i].gameObject.SetActive(false);
                    this.panelBlackUI[i].gameObject.SetActive(false);
                    this.panelPurpleUI[i].gameObject.SetActive(false);
                }
            });

            this.room.AddMessageHandler<string[]>("playerRank", (message) => {
                this.playerArr = message;

                for (let i = 0; i < this.playerArr.length; i++) {
                    if(this.playerId == this.playerArr[i]){
                        this.panelBlackUI[i].gameObject.SetActive(false);
                        this.panelPurpleUI[i].gameObject.SetActive(true);
                    } else {
                        this.panelBlackUI[i].gameObject.SetActive(true);
                        this.panelPurpleUI[i].gameObject.SetActive(false);
                    }

                    ZepetoWorldHelper.GetProfileTexture(this.playerArr[i], (texture: UnityEngine.Texture) => {
                        this.playerProfile[i].sprite = this.GetSprite(texture);
                    }, (error) => {
                        console.log(error);
                    });
                }
            });

            this.room.AddMessageHandler<number[]>("totalScore", (message) => {
                this.scoreArr = message;

                for (let i = 0; i < this.playerArr.length; i++) {
                    this.socreUI[i].text = this.scoreArr[i].toString();
                }
            });
        };

        this.multiplay.RoomJoined += (room: Room) => {
            room.OnStateChange += this.OnStateChange;
        };

        this.StartCoroutine(this.SendMessageLoop(0.1));
    }

    Update() {
        if(this.gamestartFlag) {
            this.startTimer += UnityEngine.Time.deltaTime;
            if(this.startTimer > 2) {
                this.startImage.gameObject.SetActive(false);
                this.gamestartFlag = false;
                this.startTimer = 0;
            }
        }
        if(this.gameoverFlag) {
            this.endingTimer += UnityEngine.Time.deltaTime;
            if(this.endingTimer > 2) {
                this.room.Send("chooseWinner", "");

                this.endingImage.gameObject.SetActive(false);
                this.gameoverFlag = false;
                this.endingTimer = 0;
            }
        }
    }

    // 일정 Interval Time으로 내(local)캐릭터 transform을 server로 전송합니다.
    private * SendMessageLoop(tick: number) {
        while (true) {
            yield new UnityEngine.WaitForSeconds(tick);

            if (this.room != null && this.room.IsConnected) {
                const hasPlayer = ZepetoPlayers.instance.HasPlayer(this.room.SessionId);
                if (hasPlayer) {
                    const myPlayer = ZepetoPlayers.instance.GetPlayer(this.room.SessionId);
                    if (myPlayer.character.CurrentState != CharacterState.Idle)
                        this.SendTransform(myPlayer.character.transform);
                }
            }
        }
    }

    private OnStateChange(state: State, isFirst: boolean) {

        // 첫 OnStateChange 이벤트 수신 시, State 전체 스냅샷을 수신합니다.
        if (isFirst) {

            // [CharacterController] (Local)Player 인스턴스가 Scene에 완전히 로드되었을 때 호출
            ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
                const myPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;

                myPlayer.character.OnChangedState.AddListener((cur, next) => {
                    this.SendState(next);
                });
            });

            // [CharacterController] Player 인스턴스가 Scene에 완전히 로드되었을 때 호출
            ZepetoPlayers.instance.OnAddedPlayer.AddListener((sessionId: string) => {
                const isLocal = this.room.SessionId === sessionId;
                if (!isLocal) {
                    const player: Player = this.currentPlayers.get(sessionId);

                    // [RoomState] player 인스턴스의 state가 갱신될 때마다 호출됩니다.
                    player.OnChange += (changeValues) => this.OnUpdatePlayer(sessionId, player);
                }
            });
        }

        let join = new Map<string, Player>();
        let leave = new Map<string, Player>(this.currentPlayers);

        state.players.ForEach((sessionId: string, player: Player) => {
            if (!this.currentPlayers.has(sessionId)) {
                join.set(sessionId, player);
            }
            leave.delete(sessionId);
        });

        // [RoomState] Room에 입장한 player 인스턴스 생성
        join.forEach((player: Player, sessionId: string) => this.OnJoinPlayer(sessionId, player));

        // [RoomState] Room에서 퇴장한 player 인스턴스 제거
        leave.forEach((player: Player, sessionId: string) => this.OnLeavePlayer(sessionId, player));
    }

    private OnJoinPlayer(sessionId: string, player: Player) {
        console.log(`[OnJoinPlayer] players - sessionId : ${sessionId}`);
        this.currentPlayers.set(sessionId, player);

        const spawnInfo = new SpawnInfo();
        const position = this.ParseVector3(player.transform.position);
        const rotation = this.ParseVector3(player.transform.rotation);
        spawnInfo.position = position;
        spawnInfo.rotation = UnityEngine.Quaternion.Euler(rotation);

        const isLocal = this.room.SessionId === player.sessionId;
        if(isLocal) {
            this.playerId = player.zepetoUserId;
        }
        ZepetoPlayers.instance.CreatePlayerWithUserId(sessionId, player.zepetoUserId, spawnInfo, isLocal);

        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            let _player = ZepetoPlayers.instance.LocalPlayer;
            let playerObj: UnityEngine.GameObject = _player.zepetoPlayer.character.gameObject;
            playerObj.gameObject.tag = "Player";
        });
    }

    private OnLeavePlayer(sessionId: string, player: Player) {
        console.log(`[OnRemove] players - sessionId : ${sessionId}`);
        this.currentPlayers.delete(sessionId);

        ZepetoPlayers.instance.RemovePlayer(sessionId);
    }

    private OnUpdatePlayer(sessionId: string, player: Player) {

        const position = this.ParseVector3(player.transform.position);

        const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);
        zepetoPlayer.character.MoveToPosition(position);

        if (player.state === CharacterState.JumpIdle || player.state === CharacterState.JumpMove)
            zepetoPlayer.character.Jump();
    }

    private SendTransform(transform: UnityEngine.Transform) {
        const data = new RoomData();

        const pos = new RoomData();
        pos.Add("x", transform.localPosition.x);
        pos.Add("y", transform.localPosition.y);
        pos.Add("z", transform.localPosition.z);
        data.Add("position", pos.GetObject());

        const rot = new RoomData();
        rot.Add("x", transform.localEulerAngles.x);
        rot.Add("y", transform.localEulerAngles.y);
        rot.Add("z", transform.localEulerAngles.z);
        data.Add("rotation", rot.GetObject());
        this.room.Send("onChangedTransform", data.GetObject());
    }

    private SendState(state: CharacterState) {
        const data = new RoomData();
        data.Add("state", state);
        this.room.Send("onChangedState", data.GetObject());
    }

    private ParseVector3(vector3: Vector3): UnityEngine.Vector3 {
        return new UnityEngine.Vector3
            (
                vector3.x,
                vector3.y,
                vector3.z
            );
    }

    public getRoom(): Room {
        return this.room;
    }

    public getScore(): number {
        return this.score;
    }

    public setScore(n: number) {
        this.score = n;
        this.room.Send("setScore", this.playerId + "/" + this.score);
    }

    public GetSprite(texture: UnityEngine.Texture) {
        let rect: UnityEngine.Rect = new UnityEngine.Rect(0, 0, texture.width, texture.height);
        return UnityEngine.Sprite.Create(texture as UnityEngine.Texture2D, rect, new UnityEngine.Vector2(0.5, 0.5));
    }

    public getCharacter(): ZepetoPlayer {
        return ZepetoPlayers.instance.GetPlayer(this.room.SessionId);
    }

    public exitFunction(introductImage: UnityEngine.GameObject, exitBtn: Button) {
        introductImage.gameObject.SetActive(false);
        exitBtn.gameObject.SetActive(false);
    }
}