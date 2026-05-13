// AudioManager.ts
// 音频管理器：背景音乐、音效播放

const { ccclass, property } = cc._decorator;

@ccclass
export default class AudioManager extends cc.Component {

    private static _instance: AudioManager = null;
    public static get instance(): AudioManager {
        return AudioManager._instance;
    }

    @property(cc.AudioClip)
    bgmClip: cc.AudioClip = null;

    @property(cc.AudioClip)
    clickClip: cc.AudioClip = null;

    @property(cc.AudioClip)
    harvestClip: cc.AudioClip = null;

    @property(cc.AudioClip)
    plantClip: cc.AudioClip = null;

    @property(cc.AudioClip)
    unlockClip: cc.AudioClip = null;

    @property
    bgmVolume: number = 0.5;

    @property
    sfxVolume: number = 1.0;

    private bgmId: number = -1;
    private isMuted: boolean = false;

    onLoad() {
        if (AudioManager._instance) {
            this.node.destroy();
            return;
        }
        AudioManager._instance = this;
        cc.game.addPersistRootNode(this.node);
    }

    /** 播放背景音乐 */
    public playBGM() {
        if (this.isMuted || !this.bgmClip) return;
        if (this.bgmId !== -1) {
            cc.audioEngine.stop(this.bgmId);
        }
        this.bgmId = cc.audioEngine.play(this.bgmClip, true, this.bgmVolume);
    }

    /** 停止背景音乐 */
    public stopBGM() {
        if (this.bgmId !== -1) {
            cc.audioEngine.stop(this.bgmId);
            this.bgmId = -1;
        }
    }

    /** 播放音效 */
    public playSFX(clip: cc.AudioClip) {
        if (this.isMuted || !clip) return;
        cc.audioEngine.play(clip, false, this.sfxVolume);
    }

    public playClick() {
        this.playSFX(this.clickClip);
    }

    public playHarvest() {
        this.playSFX(this.harvestClip);
    }

    public playPlant() {
        this.playSFX(this.plantClip);
    }

    public playUnlock() {
        this.playSFX(this.unlockClip);
    }

    /** 静音切换 */
    public toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            cc.audioEngine.pauseAll();
        } else {
            cc.audioEngine.resumeAll();
            this.playBGM();
        }
    }
}
