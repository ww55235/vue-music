import storage from "storejs";
import { Toast } from "vant";
import { FAVORITE_SONG_KEY, PLAY_MODE } from "../assets/js/constant.js";
import { getRandom, shuffle } from "../assets/js/util.js";

export default {
  // 从我喜欢的歌曲列表中移除掉一首歌曲
  async delOneSongFromFavorite({ state, commit, dispatch }, song) {
    //let currentIndex = state.currentIndex;
    const songs = state.favoriteSongList;
    let index = songs.findIndex((item) => item.id === song.id);
    if (index > -1) {
      songs.splice(index, 1);
      commit("setFavoriteSongList", songs);
      storage.set(FAVORITE_SONG_KEY, songs);
      // dispatch("delSong", song);
    }
    // 要从playList中删除的歌曲索引位置
    // const playIndex = state.playList.findIndex((item) => item.id === song.id);
    // if (playIndex > -1) {
    //   // 判断currentIndex
    //   if (playIndex < currentIndex || ) {
    //   }
    // }
  },
  // 添加一条歌曲到playList中
  async addSongToPlayList({ state, commit }, song) {
    //  debugger;
    const playList = state.playList;
    const sequenceList = state.sequenceList;
    commit("addRecentlyPlaySong", song);
    //debugger;
    let findSong = playList.find((item) => item.id === song.id);
    // console.log(findSong, "findSong");
    //debugger;
    if (!findSong) {
      playList.push(song);
    }
    let findSongSequenceList = sequenceList.find((item) => item.id === song.id);
    if (!findSongSequenceList) {
      sequenceList.push(song);
    }
    commit("setPlayList", playList);
    commit("setSequenceList", sequenceList);
    if (!findSong) {
      console.log(state.playList.length - 1, "state.playList.length - 1");
      commit("setCurrentIndex", state.playList.length - 1);
    }
    let i = 0;
    if (findSong) {
      i = state.playList.findIndex((item) => item.id === song.id);
      commit("setCurrentIndex", i);
    }
    commit("setFullScreen", true);
    commit("setPlaying", true);
  },
  // 删除一首歌曲
  delSong({ state, commit }, song) {
    //  debugger;
    // 这里先拷贝一份, 不要直接修改, 直接修改会出问题, 直接修改会导致currentSong的变化
    const playList = state.playList.slice();
    const sequenceList = state.sequenceList.slice();
    // 正在播放的歌曲索引
    let playingSongIndex = state.currentIndex;
    let playListIndex = playList.findIndex((item) => item.id === song.id);
    let sequenceListIndex = sequenceList.findIndex(
      (item) => item.id === song.id
    );
    playList.splice(playListIndex, 1);
    sequenceList.splice(sequenceListIndex, 1);
    // 如果歌曲已经被删完了,那么停止歌曲播放
    if (playList.length === 0) {
      Toast("请添加歌曲至播放列表");
      commit("setPlaying", false);
      commit("setPlayList", playList);
      commit("setSequenceList", sequenceList);
      commit("setCurrentIndex", -1);
      return;
    }
    // 如果删除的是之前的歌曲,那么就索引减1, 如果删除的是最后一项也需要减1
    if (
      playListIndex < playingSongIndex ||
      playingSongIndex === state.playList.length
    ) {
      playingSongIndex--;
    }
    commit("setPlayList", playList);
    commit("setSequenceList", sequenceList);
    //  console.log("1.0");
    commit("setCurrentIndex", playingSongIndex);
    //   console.log("2.0");
  },
  // 用户点击了一首歌曲
  async selectSong({ commit, state }, song) {
    let index = state.playList.findIndex((item) => item.id === song.id);
    if (index === -1) {
      index = 0;
    }
    commit("setPlaying", true);
    commit("setFullScreen", true);
    commit("setPlayMode", PLAY_MODE.sequence);
    commit("setCurrentIndex", index);
  },
  // 随机播放全部
  async randomPlay({ commit, state, getters }, { list, index }) {
    let num = getRandom(0, list.length);
    //  console.log(getters.js.currentIndex);
    commit("setCurrentIndex", num);
    // commit("setPlayList", shuffle(list));
    commit("setPlayList", list);
    // 先获取到当前正在播放的歌曲
    commit("setPlayMode", PLAY_MODE.random);
    commit("setPlaying", true);
  },

  // 播放模式的修改
  changeMode({ commit, state, getters }, mode) {
    const currentSongId = getters.currentSong.id;
    // 随机播放
    if (PLAY_MODE.random === mode) {
      //  commit("setPlayList", shuffle(state.sequenceList));
      commit("setPlayList", shuffle(state.playList));
      Toast({
        type: "success",
        message: "已切换到随机播放",
      });
      console.log("随机播放");
    } else if (PLAY_MODE.sequence === mode) {
      // 顺序播放
      Toast({
        type: "success",
        message: "已切换到顺序播放",
      });
      //console.log("顺序播放");
      //  commit("setPlayList", state.sequenceList);
      commit("setPlayList", state.playList);
    } else {
      // 单曲循环
      Toast({
        type: "success",
        message: "已切换到单曲循环",
      });
      console.log("单曲循环");
      // Toast.success("已切换到单曲循环");
    }
    let index = state.playList.findIndex((song) => {
      return song.id === currentSongId;
    });
    // 如果没有找到默认就是第一手歌曲
    if (index === -1) {
      index = 0;
    }
    commit("setCurrentIndex", index);
    commit("setPlayMode", mode);
  },
};
