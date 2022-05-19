<template>
  <transition name="popdown">
    <div class="top-title" v-show="fullScreen" ref="topTitleRef">
      <header class="header">
        <i class="iconfont icon-back" @click.stop="noFullScreen"></i>
        <span class="song-name">{{ currentSong.name }}</span>
        <span class="singer-name">
          {{ currentSong.singer }}
        </span>
      </header>
    </div>
  </transition>
  <!--全屏播放器-->
  <transition name="move">
    <div class="play-music" v-show="fullScreen">
      <div
        class="cd-swiper-wrapper"
        @touchstart="cdTouchstart"
        @touchmove="cdTouchmove"
        @touchend="cdTouchend"
        ref="cdSwiperWrapperRef"
        :style="{ height: cdWrapperHeight + 'px' }"
      >
        <!-- Slider main container -->
        <div class="my-swipe" ref="cdSwiperRef">
          <!-- Additional required wrapper -->
          <div class="swiper-wrapper">
            <!-- Slides -->
            <div class="swiper-slide slide slide1" ref="cdSwiperSlideRef">
              <div class="singer-pic-wrapper">
                <div class="pic-box" ref="picBoxRef">
                  <img
                    ref="picBoxImgRef"
                    :class="isPlaying ? 'turn' : ''"
                    :src="currentSong.pic"
                    alt=""
                  />
                </div>
              </div>
              <div class="currentLyric-wrapper">
                <span class="text">{{ currentLyricText }}</span>
              </div>
            </div>
            <div class="swiper-slide slide">
              <div class="_wrapper">
                <div
                  class="scroll-wrapper"
                  ref="scrollRef"
                  :style="{ height: cdWrapperHeight - 60 + 'px' }"
                >
                  <div @touchend="scrollEnd">
                    <div class="lyric-wrapper" v-if="currentLyric">
                      <p
                        class="lyric-text"
                        v-for="(line, index) of currentLyric.lines"
                        :style="{
                          color: currentLyricNum === index ? '#ffcd32' : '',
                        }"
                        :key="index"
                      >
                        <span @click.stop="lyricTextClick(line, index)">{{
                          line.txt
                        }}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="swiper-pagination"></div>
        </div>
      </div>
    </div>
  </transition>
  <!--  歌曲播放时长区域   -->
  <transition
    enter-active-class="animate__animated animate__fadeInBottomRight"
    leave-active-class="animate__animated animate__fadeOutBottomRight"
    :style="{ transition: `all .6s` }"
  >
    <div
      v-show="fullScreen"
      :style="{ transition: `all .6s` }"
      class="song-play-time-wrapper"
      ref="songPlayTimeWrapperRef"
    >
      <span class="play-time">{{
        formatDuration(Math.floor(currentTime))
      }}</span>
      <div
        class="progress-wrapper"
        ref="barRef"
        @touchstart="touchstart"
        @touchmove="touchmove"
        @touchend="touchend"
      >
        <van-progress
          stroke-width="4px"
          color="#ffcd32"
          track-color="#363b32"
          :show-pivot="false"
          :percentage="progressBarWidth"
        />
      </div>
      <span class="song-duration">{{
        formatDuration(Math.floor(currentSong.duration))
      }}</span>
    </div>
  </transition>
  <!--控制按钮区域-->
  <transition
    enter-active-class="animate__animated animate__fadeInBottomRight"
    leave-active-class="animate__animated animate__fadeOutBottomRight"
    :style="{ transition: `all 1s` }"
  >
    <div v-show="fullScreen" class="play-control-wrapper">
      <span class="play-mode-icon-wrapper">
        <i :class="['iconfont', playModeIcon]" @click.stop="togglePlayMode"></i>
      </span>
      <i
        class="iconfont icon-prev"
        @click.stop="prevSong"
        :style="disableStyle"
      ></i>
      <span
        class="is-playing"
        @click.stop="toggleSongPlay"
        :style="disableStyle"
      >
        <!--播放时候显示的按钮-->
        <i class="iconfont" :class="isPlaying ? 'icon-pause' : 'icon-play'"></i>
      </span>
      <i
        class="iconfont icon-next"
        @click.stop="nextSong"
        :style="disableStyle"
      ></i>
      <i
        class="iconfont"
        @click.stop="favoriteIconClick(currentSong)"
        :class="isFavorite(currentSong)"
        :style="{ color: favoriteColor(currentSong) }"
      ></i>
    </div>
  </transition>
  <!--迷你的播放器-->
  <transition name="popup">
    <div class="mini-play-wrapper" v-show="!fullScreen && currentSong.url">
      <div class="mini-play-content">
        <div
          class="img-wrapper"
          @click.stop="fullScreenHandle"
          ref="miniImgWrapperRef"
        >
          <img
            ref="miniImgRef"
            :class="isPlaying ? 'turn' : ''"
            :src="currentSong.pic"
            alt=""
          />
        </div>
        <div class="song-name-wrapper" @click.stop="fullScreenHandle">
          <van-swipe
            class="song-name-swipe"
            @change="switchSong"
            :show-indicators="false"
            :duration="200"
            ref="songNameSwipe"
          >
            <template v-for="song of playList" :key="song.id">
              <van-swipe-item class="van-swipe-item">
                <span class="song-name">{{ song.name }}</span>
                <span class="singer-name">{{ song.singer }}</span>
              </van-swipe-item>
            </template>
          </van-swipe>
        </div>
        <div class="icon-control-wrapper">
          <div class="icon-play-progress" @click.stop="miniPlay">
            <van-circle
              class="circle"
              v-model:current-rate="progressBarWidth"
              :stroke-width="150"
              layer-color="#5b5b5b"
              :speed="100"
              color="#cca732"
              size="30px"
            />
            <img
              class="control-play"
              :src="
                require(`@/assets/images/${isPlaying ? 'pause2' : 'play'}.png`)
              "
              alt=""
            />
            <!--            <i-->
            <!--              class="iconfont control-play"-->
            <!--              :class="isPlaying ? 'icon-pause-mini' : 'icon-play-mini'"-->
            <!--            ></i>-->
          </div>
          <i class="iconfont icon-playlist" @click.stop="showMask"></i>
        </div>
      </div>
    </div>
  </transition>
  <!-- -->
  <transition name="fade">
    <div
      class="mask"
      @click.stop="hideMask"
      v-show="isShowMask && !fullScreen && sequenceList.length > 0"
    ></div>
  </transition>
  <transition name="popup">
    <div
      class="play-list"
      v-show="isShowMask && !fullScreen && sequenceList.length"
    >
      <header class="header">
        <div class="left-box" @click.stop="togglePlayMode">
          <i :class="['iconfont', playModeIcon]"></i>
        </div>
        <div class="middle-box">
          <span class="text">{{ playModeText }}</span>
        </div>
        <div class="right-box" @click.stop="clearPlayList">
          <span class="clear-icon-wrapper">
            <i class="iconfont icon-clear"></i>
          </span>
        </div>
      </header>
      <div class="play-list-scroll-wrapper" ref="playListScrollRef">
        <div>
          <transition-group name="leave">
            <div
              class="play-list-item-wrapper"
              v-for="(song, index) of sequenceList"
              :key="song.id"
            >
              <!--            <transition name="list">-->
              <!--              v-show="!song.isDel"-->
              <div class="play-list-item">
                <!--<span>{{ song.isDel }}</span>-->
                <div
                  class="playing-icon-wrapper"
                  v-if="currentSong.id === song.id"
                >
                  <i class="iconfont icon-play"></i>
                </div>
                <div class="song-name" @click.stop="playingSong(song)">
                  {{ song.name }}
                </div>
                <div class="right-control">
                  <span class="icon-wrapper">
                    <i
                      @click.stop="favoriteIconClick(song)"
                      :class="['iconfont', 'favorite-btn', isFavorite(song)]"
                      :style="{ color: favoriteColor(song) }"
                    ></i>
                    <i
                      :class="removeING ? 'removeING' : ''"
                      class="iconfont icon-close close-btn"
                      @click.stop="delSong(song)"
                    ></i>
                  </span>
                </div>
              </div>
              <!--            </transition>-->
            </div>
          </transition-group>
        </div>
      </div>
      <div class="add-song">
        <div @click.stop="showAddSongSection">
          <!--@click.stop="addToPlayListQueue(song)"-->
          <svg
            t="1650811025936"
            class="icon"
            viewBox="0 0 1025 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="45618"
            width="16"
            height="16"
          >
            <path
              d="M512 1024c-282.787759 0-512-229.248343-512-512C0 229.212241 229.212241 0 512 0 794.751657 0 1024.036102 229.212241 1024.036102 512 1024.036102 794.787759 794.751657 1024 512 1024zM768.036102 460.80722l-204.80722 0L563.228882 256 460.843323 256l0 204.80722L256 460.80722l0 102.385559 204.80722 0 0 204.80722 102.385559 0 0-204.80722 204.80722 0L768 460.80722z"
              p-id="45619"
              fill="#ffcd32"
            ></path>
          </svg>
          <span>添加歌曲到队列</span>
        </div>
      </div>
      <div class="button-close" @click.stop="hideMask">关闭</div>
    </div>
  </transition>
  <!--  </div>-->
  <!-- 添加歌曲组件-->
  <transition name="popup">
    <add-song v-if="isShowAddSongSection" @hide="hideAddSongSection"></add-song>
  </transition>
  <!--播放音乐标签-->
  <audio
    ref="audioRef"
    @canplay="canplay"
    @durationchange="durationchange"
    @timeupdate="timeupdate"
    @ended="ended"
    @pause="pause"
    @error="error"
  ></audio>
  <confirm
    v-if="visible"
    v-model:visible="visible"
    message="是否清空播放列表?"
    @confirm="confirmHandle"
    @cancel="cancel"
  ></confirm>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  defineExpose,
  nextTick,
  onUnmounted,
  onMounted,
} from 'vue'
import { formatDuration, createSnow } from '@/assets/js/util'
// import { Pagination } from "swiper";
// import { Swiper, SwiperSlide } from "swiper/vue";
// import "swiper/css";
// import "swiper/css/pagination";
import { useStore } from 'vuex'
import { PLAY_MODE } from '@/assets/js/constant'
import { getLyric } from '@/service/song'
import Lyric from 'lyric-parser'
import BScroll from 'better-scroll'
import AddSong from '@/components/add-song/add-song'
import { myProcessSongs } from '@/api/song'
import { processSongs } from '@/service/song'
import confirm from '@/components/confirm/confirm.vue'

// 音乐标签对应ref
const audioRef = ref(null)
// const modules = [Pagination];
const cdSwiperWrapperRef = ref(null)
// vuex store
const store = useStore()
const isShowMask = ref(false)

// 是否显示添加歌曲到列表区域
const isShowAddSongSection = ref(false)

function showAddSongSection() {
  isShowAddSongSection.value = true
}

function mySwiperChange(index) {
  console.log(index, 'indexdddd')
}

// 控制雪花创建的定时器
const controlCreateSnowTimer = ref(null)

function hideAddSongSection() {
  isShowAddSongSection.value = false
}

const cdSwiperActiveIndex = ref(0)
const cdSwiperSlideRef = ref(null)
const slideChangeFull = ref(false)
// onMounted(() => {
//   console.log(cdSwiperRef.value, "cdSwiperRef.value");
//   // debugger;
// });
const cdTimer = ref(null)

// cd 唱片部分swiper切换
async function cdSectionSwiperChange(event) {
  console.log(event.activeIndex, 'event.activeIndex')
  //let height = this.cdWrapperHeight;
  // if (event.activeIndex === 0) {
  //   this.cdWrapperHeight = 420;
  // } else {
  // }
  //console.log(event, "event");
  //console.log(scrollWrapper.value, "aaaa");
  try {
    if (scrollWrapper.value) {
      await nextTick()
      scrollWrapper.value.refresh()
      let lineNum = currentLyricNum.value
      //console.log(scrollRef.value, "scrollRef.value-handler");
      const childrens = scrollRef.value
        .querySelector('.lyric-wrapper')
        .querySelectorAll('.lyric-text')
      const scrollWrapperValue = scrollWrapper.value
      //  console.log(scrollWrapperValue, "scrollWrapperValue");
      if (scrollWrapperValue) {
        if (lineNum > 5) {
          lineNum -= 5
        }
        scrollWrapperValue.scrollToElement(childrens[lineNum], 300)
      }
    }
  } catch (err) {}
  cdMovePageX = 0
  clearTimeout(cdTimer.value)
  // debugger;
  let activeIndex = event.activeIndex
  //slideChangeFull.value = true;
  cdTimer.value = setTimeout(async () => {
    cdSwiperActiveIndex.value = activeIndex
    if (activeIndex === 1) {
      await nextTick()
      let lineNum = currentLyricNum.value
      const childrens = scrollRef.value
        .querySelector('.lyric-wrapper')
        .querySelectorAll('.lyric-text')
      const scrollWrapperValue = scrollWrapper.value
      if (scrollWrapperValue) {
        if (lineNum > 5) {
          lineNum -= 5
        }
        scrollWrapperValue.scrollToElement(childrens[lineNum], 300)
      }
    }
    //   slideChangeFull.value = false;
  }, 30)
  //console.log(activeIndex, "activeIndexqq");
}

let cdStartPageX = 0,
  cdMovePageX = 0

function cdTouchstart(event) {
  cdStartPageX = 0
  cdMovePageX = 0
  //debugger;
  cdStartPageX = event.touches[0].pageX
  // console.log(event, "cdTouchstart");
  // console.log(cdStartPageX, "cdStartPageXcdStartPageX");
}

function cdTouchmove(event) {
  cdMovePageX = 0
  // debugger;
  // console.log("cdTouchmove");
  cdMovePageX = event.touches[0].pageX
  //debugger;
  //  console.log(cdMovePageX, "cdMovePageXcdMovePageX");
  //console.log(event, "cdTouchmove");
}

function cdTouchend(event) {
  // clearTimeout(cdTimer.value);
  // console.log(event, "eventend");
  // console.log("cdTouchend");
  // debugger;
  //debugger;
  // if (!slideChangeFull.value) {
  //   return;
  // }
  const OFFSET = 80
  //let cdSwiperActiveIndexVal = cdSwiperActiveIndex.value;
  // console.log();
  if (cdMovePageX <= 0) {
    return
  }
  let value = Math.floor(cdMovePageX) - Math.floor(cdStartPageX)
  // console.log("value=" + value);
  // console.log(cdSwiperActiveIndex.value, "cdSwiperActiveIndex");
  if (Math.abs(value) < OFFSET) {
    return
  }
  if (cdSwiperActiveIndex.value === 1 && value < 0 && cdMovePageX > 0) {
    // 向左边移动,切换下一首歌曲
    value = Math.abs(value)
    // 判断距离是不是大于等于 我们设置的数值 offset
    // console.log(value, `大于${OFFSET}吗?`);
    if (value >= OFFSET) {
      nextSong()
    }
    slideChangeFull.value = false
    return
  }
  if (cdSwiperActiveIndex.value === 0 && value > 0 && cdMovePageX > 0) {
    // debugger;
    // 向右边移动,切换上一首歌曲
    value = Math.abs(value)
    if (value >= OFFSET) {
      prevSong()
    }
  }
}

// 创建雪花函数
function createSnowHandle(delay = 300) {
  controlCreateSnowTimer.value = setInterval(() => {
    //  console.log(cdSwiperWrapperRef.value, "cdSwiperWrapperRef.value");
    createSnow(cdSwiperWrapperRef.value, delay)
  }, delay)
}

// 停止创建函数
function stopCreateSnowHandle() {
  clearInterval(controlCreateSnowTimer.value)
}

// 播放器 报错了
async function error(event) {
  // debugger;
  // console.log("error了");
  // debugger;
  // 歌曲播放出错,有可能是歌曲url地址过期了
  // 拿到歌曲我们直接去获取一个url
  try {
    let song = currentSong.value
    if (song.isWY) {
      //某易云音乐的路径
      let [songObj] = await myProcessSongs([song])
      if (songObj) {
        try {
          audioRef.value.src = songObj.url
          currentSong.value.url = songObj.url
          songReady.value = true
          store.commit('setPlaying', true)
          if (songObj.url) {
            store.commit('addRecentlyPlaySong', currentSong.value)
          }
        } catch (err) {
          nextSong()
          // console.log(err, "err");
          //  store.commit("setPlaying", false);
        }
      }
      // debugger;
    } else {
      //QQ音乐接口
      let [songObj] = await processSongs([song])
      if (songObj) {
        try {
          audioRef.value.src = songObj.url
          currentSong.value.url = songObj.url
          store.commit('setPlaying', true)
          songReady.value = true
          if (songObj.url) {
            store.commit('addRecentlyPlaySong', currentSong.value)
          }
        } catch (err) {
          nextSong()
          console.log(err, 'err')
          // store.commit("setPlaying", false);
        }
      }
      //  debugger;
    }
  } catch (err) {
    // console.log("error", "播放器报错了");
    // debugger;
    stopCreateSnowHandle()
    store.commit('setPlaying', false)
    // 切换到下一首歌曲
    // nextSong();
  }
}

// 迷你播放器 滑动切歌
function switchSong(index) {
  // console.log(index, "switchSong", "执行了。。。");
  // //获取到当前的歌曲
  //  console.log(index);
  store.commit('setCurrentIndex', index)
  if (!isPlaying.value) {
    store.commit('setPlaying', true)
  }
  //console.log(index, "switchSong");
}

function showMask() {
  isShowMask.value = true
}

watch(isShowAddSongSection, newVal => {
  if (newVal) {
    hideMask()
  }
})

function hideMask() {
  isShowMask.value = false
}

// 控制confirm组件显示和隐藏
const visible = ref(false)

async function confirmHandle() {
  isShowMask.value = false
  // 清空播放列表
  // 让歌曲暂停掉
  store.commit('setPlaying', false)
  store.commit('clearPlayList')
  //  store.commit("setPlayList", []);
  store.commit('setSequenceList', [])
  store.commit('setCurrentIndex', -1)
}

async function cancel() {}

// 进度条父盒子ref
const barRef = ref(null)
// 歌曲是否已经缓冲好了
const songReady = ref(true)
// 用户是否手动点击了暂停
const isUserPause = ref(false)
// 用户手指是否移动 progress
const isMove = ref(false)

const scrollRef = ref(null)
const progressChange = ref(false)
const scrollWrapper = ref(null)
let currentLyric = ref(null)
let currentLyricText = ref('')

const swiperInstance = ref(null)

const currentLyricNum = ref(0)
let time1 = ref(null)

const picBoxRef = ref(null)
const picBoxImgRef = ref(null)

const songNameSwipe = ref(null)

// 进度条对应的宽度
const progressBarWidth = ref(0)
// 音乐当前播放的时间
const currentTime = ref(0)
// 当前的歌曲
const currentSong = computed(() => {
  return store.getters.currentSong
})

const cdSwiperRef = ref(null)

//是否正在播放
const isPlaying = computed(() => {
  return store.getters.isPlaying
})
// 歌曲的长度
const songsLength = computed(() => {
  return store.getters.songsLength
})
// 当前播放歌曲对应的索引
const currentIndex = computed(() => {
  return store.getters.currentIndex
})
const songPlayTimeWrapperRef = ref(null)
onMounted(async () => {
  // console.log(songPlayTimeWrapperRef.value, "songPlayTimeWrapperRef");
  //const clientHeight = getComputedStyle(songPlayTimeWrapperRef.value).height;
  //  console.log(clientHeight, "clientHeight");
  // 初始化Swiper
  swiperInstance.value = new window.Swiper('.my-swipe', {
    pagination: {
      el: '.swiper-pagination',
      // 分页器可以点击
      clickable: true,
    },
  })
  // 监听滑块的切换
  swiperInstance.value.on('slideChange', cdSectionSwiperChange)
})
// mask 点击播放歌曲
function playingSong(song) {
  let i = playList.value.findIndex(item => item.id === song.id)
  // 找到了
  if (i > -1) {
    store.commit('setCurrentIndex', i)
    store.commit('setPlaying', true)
  } else {
    // 如果没有找到
  }
}

// 播放的模式
const playMode = computed(() => {
  return store.state.playMode
})

const favoriteSongList = computed(() => {
  return store.state.favoriteSongList
})

// 喜欢的歌曲icon颜色
function favoriteColor(song) {
  const findItem = favoriteSongList.value.find(item => {
    return item.id === song.id
  })
  return findItem ? '#d93f30' : ''
}

const playModeIcon = computed(() => {
  const _playModeIcon = {
    [PLAY_MODE.sequence]: 'icon-sequence',
    [PLAY_MODE.random]: 'icon-random',
    [PLAY_MODE.loop]: 'icon-loop',
  }
  return _playModeIcon[playMode.value]
})

// 顺序播放数据
const sequenceList = computed(() => store.state.sequenceList)

watch(sequenceList, async () => {
  await nextTick()
  playListScrollInstance.value.refresh()
})

const playList = computed(() => {
  return store.getters.playList
})

watch(isShowMask, async newVal => {
  await nextTick()
  if (playListScrollInstance.value) {
    playListScrollInstance.value.refresh()
  }
  scrollToCurrentSongSection()
})

async function scrollToCurrentSongSection() {
  await nextTick()
  // debugger;
  const scroll = playListScrollInstance.value
  const children = playListScrollRef.value.querySelectorAll(
    '.play-list-item-wrapper'
  )
  if (currentSongIndex.value === -1) {
    return
  }
  let i = sequenceList.value.findIndex(item => item.id === currentSong.value.id)
  // 寻找歌曲在sequenceList中的索引
  if (i > -1) {
    if (scroll) {
      scroll.refresh()
      scroll.scrollToElement(children[i], 100)
    }
  }
}

watch(
  playList,
  async () => {
    await nextTick()
    if (playListScrollInstance.value) {
      playListScrollInstance.value.refresh()
    } else {
      playListScrollInstance.value = new BScroll(playListScrollRef.value, {
        observeDOM: true,
        click: true,
      })
    }
  },
  { deep: true }
)

const playModeText = computed(() => {
  const _playModeText = {
    [PLAY_MODE.sequence]: '顺序播放',
    [PLAY_MODE.random]: '随机播放',
    [PLAY_MODE.loop]: '单曲循环',
  }
  let text = _playModeText[playMode.value]
  return text
})

// 不可点击样式
const disableStyle = computed(() => {
  if (!songReady.value) {
    return {
      opacity: 0.3,
    }
  }
  return {
    opacity: 1,
  }
})

const fullScreen = computed(() => {
  return store.getters.fullScreen
})

async function handler({ lineNum, txt }) {
  currentLyricText.value = txt
  currentLyricNum.value = lineNum
  // );
  try {
    await nextTick()
    //console.log(scrollRef.value, "scrollRef.value-handler");
    const childrens = scrollRef.value
      .querySelector('.lyric-wrapper')
      .querySelectorAll('.lyric-text')
    const scrollWrapperValue = scrollWrapper.value
    // console.log(scrollWrapperValue, 'scrollWrapperValue')
    if (scrollWrapperValue) {
      if (lineNum > 5) {
        lineNum -= 5
      }
      scrollWrapperValue.scrollToElement(childrens[lineNum], 300)
    }
  } catch (err) {}
}

onUnmounted(() => {
  store.commit('setCurrentIndex', -1)
  store.commit('setPlaying', false)
  scrollWrapper.value = null
  audioRef.value = null
  // 暂停播放
  // audioRef.value.pause();
  stopLyric()
})

const currentSongIndex = computed(() => store.state.currentIndex)
const scrollY = ref(0)

async function scrollIngFun(pos) {
  stopLyric()
  //console.log("scrollIngFun");
  //console.log("scrollIng");
  clearTimeout(time1.value)
  scrollIng.value = true
}
function scrollEnd(event) {
  const tagName = event.target.tagName.toLowerCase()
  scrollIng.value = false
  // if (tagName === "span") {
  //   stopLyric();
  //   // 直接点击了歌词
  //   playLyric();
  //   return;
  // }
  stopLyric()
  if (!isPlaying.value) {
    return
  }
  time1.value = setTimeout(() => {
    // stopLyric();
    playLyric()
  }, 2000)
  //stopLyric();
  //  console.log(event.target.tagName.toLowerCase(), "tagName");
  // stopLyric();
  // console.log("scrollEnd");

  // playLyric();
}
// 滚动结束了
function scrollEndFun(pos) {
  // console.log("scrollEndFun");
  //  playLyric();
  //;
  // time1 = setTimeout(() => {
  //   stopLyric();
  //   playLyric();
  // }, 1000);
  // 结束后让歌词播放到具体的位置
  // console.log("滚动结束了");
}

watch(currentLyric, async () => {
  if (fullScreen.value) {
    if (scrollWrapper.value) {
      await nextTick()
      scrollWrapper.value.refresh()
    }
  }
})
const cdWrapperHeight = ref(0)
const topTitleRef = ref(null)
watch(fullScreen, async newVal => {
  // stopLyric();
  // playLyric();
  //scrollWrapper.value = null;
  await nextTick()
  // 播放时长区域的高度
  const songPlayTimeWrapperClientHeight =
    getComputedStyle(songPlayTimeWrapperRef.value).height.replace('px', '') * 1
  // console.log(
  //   songPlayTimeWrapperClientHeight,
  //   "songPlayTimeWrapperClientHeight"
  // );
  const topTitleClientHeight =
    getComputedStyle(topTitleRef.value).height.replace('px', '') * 1
  const rect = songPlayTimeWrapperRef.value.getBoundingClientRect()
  // console.log(window.innerHeight, "window.innerHeight");
  let bottom = window.innerHeight - rect.bottom
  // console.log(bottom, "bottom");
  //  console.log(
  //    songPlayTimeWrapperClientHeight,
  //    "songPlayTimeWrapperClientHeight"
  //  );
  let height =
    window.innerHeight -
    bottom -
    songPlayTimeWrapperClientHeight * 2 -
    topTitleClientHeight
  cdWrapperHeight.value = height
  // console.log(height, "height");
  // cdSwiperWrapperRef.value.style.height = cdWrapperHeight + "px";
  //console.log(cdWrapperHeight, "cdWrapperHeight");
  //console.log(rect, "rect");
  // console.log(topTitleClientHeight, "topTitleClientHeight");
  //stopLyric();
  stopCreateSnowHandle()
  if (newVal) {
    await nextTick()
    //console.log(scrollRef.value, "scrollRef.value-handler");
    //console.log(scrollRef.value, "fullScreen");
    // try {
    //   if (scrollRef.value) {
    //     let lineNum = currentLyricNum.value;
    //     const childrens = scrollRef.value
    //       .querySelector(".lyric-wrapper")
    //       .querySelectorAll(".lyric-text");
    //     const scrollWrapperValue = scrollWrapper.value;
    //     console.log(scrollWrapperValue, "scrollWrapperValue");
    //     if (scrollWrapperValue) {
    //       if (lineNum > 5) {
    //         lineNum -= 5;
    //       }
    //       scrollWrapperValue.scrollToElement(childrens[lineNum], 300);
    //     }
    //   }
    // } catch (err) {
    //   console.log(err, "err");
    // }
    createSnowHandle()
  } else {
    // 把其他的删除掉
    let childrens = cdSwiperWrapperRef.value?.querySelectorAll('.snow-wrapper')
    // 移除未做完动画的元素
    if (childrens?.length > 0) {
      childrens.forEach(children => {
        children.remove()
      })
    }
    stopCreateSnowHandle()
  }
  songNameSwipe.value.resize()
  songNameSwipe.value.swipeTo(currentSongIndex.value)
  if (scrollWrapper.value) {
    scrollWrapper.value.refresh()
  }
  scrollToCurrentSongSection()
})
// 监视playMode的变化
watch(playMode, mode => {
  audioRef.value.loop = mode === PLAY_MODE.loop
})

async function canplayHandle() {
  stopLyric()
  console.log('canplay')
  cdMovePageX = 0
  //stopCreateSnowHandle();
  // audioRef.value.loop = playMode.value === PLAY_MODE.loop;
  //console.log('canplay方法执行了!!!!!')
  //console.log(isPlaying.value, 'isPlaying.value')
  songReady.value = true
  if (isPlaying.value) {
    audioRef.value.play()
    stopCreateSnowHandle()
    if (fullScreen.value) {
      createSnowHandle()
    } else {
      stopCreateSnowHandle()
    }
    //  console.log('开始播放')
    playLyric()
  } else {
    audioRef.value.pause()
    stopCreateSnowHandle()
    // console.log('播放暂停')
    stopLyric()
  }
  await nextTick()
  songNameSwipe.value.resize()
  // console.log(songNameSwipe.value, "songNameSwipe.value");
  songNameSwipe.value.swipeTo(currentSongIndex.value)
}

// 歌曲缓冲完毕
async function canplay() {
  // await canplayHandle();
}

const lyricSectionClientHeight = ref([])

// 获取对应歌词区块高度的值
async function getLyricSectionClientHeight() {
  await nextTick()
  let height = 0
  lyricSectionClientHeight.value.push(height)
  // 获取到每一个地方的歌词高度
  const lyricWrapper = document.querySelector('.lyric-wrapper')
  // debugger;
  const lyricText = lyricWrapper?.querySelectorAll('.lyric-text')
  if (lyricText?.length > 0) {
    lyricText.forEach(text => {
      height += text.clientHeight
      lyricSectionClientHeight.value.push(height)
    })
    // console.log(
    //   lyricSectionClientHeight.value,
    //   "lyricSectionClientHeight.value"
    // );
  }
}

// 监听当前歌曲的变化
watch(currentSong, async newSong => {
  // debugger
  // console.log("currentSong-change");
  clearTimeout(time1.value)
  stopLyric()
  scrollWrapper.value = null
  cdMovePageX = 0
  progressBarWidth.value = 0
  currentTime.value = 0
  audioRef.value.currentTime = 0
  lyricSectionClientHeight.value = []
  if (!newSong.url) {
    return
  }
  await nextTick()
  scrollWrapper.value = new BScroll(scrollRef.value, {
    click: true,
    observeDOM: true,
    probeType: 2,
  })
  scrollWrapper.value.on('scroll', scrollIngFun)
  // scrollWrapper.value.on("scrollCancel", scrollEndFun);
  scrollToCurrentSongSection()
  currentLyricText.value = ''
  currentLyricNum.value = 0
  try {
    songReady.value = false
    if (!newSong.lyric) {
      const lyric = await getLyric(newSong)
      newSong.lyric = lyric
      if (newSong.lyric && newSong.url) {
        //  audioRef.value.src = newSong.url;
        store.commit('addRecentlyPlaySong', newSong)
      }
      if (currentSong.value.lyric !== lyric) {
        return
      }
    }
    currentLyric.value = new Lyric(newSong.lyric, handler)
    if (audioRef.value && newSong.url) {
      audioRef.value.src = newSong.url
      // await nextTick();
      //audioRef.value.load();
      // 开始播放歌词
      // playLyric()
      //audioRef.value.load()
    }
    if (songReady.value) {
      //playLyric();
    }
    if (currentSong.value !== newSong) {
      return
    }
    await nextTick()
    getLyricSectionClientHeight()
    songNameSwipe.value.resize()
    // console.log(songNameSwipe.value, "songNameSwipe.value");
    songNameSwipe.value.swipeTo(currentSongIndex.value)
  } catch (err) {
    // console.log(err, "报错了///");
  }
})
const miniImgWrapperRef = ref(null)
const miniImgRef = ref(null)
// 监视音乐是否播放状态
watch(isPlaying, async newVal => {
  console.log('isPlaying')
  stopLyric()
  songReady.value = true
  stopCreateSnowHandle()
  // 歌曲播放的时候也是需要 给一个 src
  //console.log("isPlaying - watch");
  // 避免暂停后再次播放从头开始播放
  audioRef.value.currentTime = currentTime.value
  if (newVal) {
    stopLyric()
    audioRef.value.play()
    // 开始播放歌词
    playLyric()
  } else {
    audioRef.value.pause()
    // 暂停播放歌词
    stopLyric()
  }
  if (!currentSong.value.url) {
    return
  }

  if (newVal && fullScreen.value) {
    createSnowHandle()
  } else {
    stopCreateSnowHandle()
    if (!fullScreen.value) {
      if (miniImgRef.value && miniImgWrapperRef.value) {
        // 内部图片的transform样式
        let miniImgStyleTransform = getComputedStyle(miniImgRef.value).transform
        // 图片包裹器的transform样式
        let miniImgWrapperStyleTransform = getComputedStyle(
          miniImgWrapperRef.value
        ).transform
        // console.log(
        //   miniImgWrapperStyleTransform,
        //   "miniImgWrapperStyleTransform"
        // );
        // 如果外部有,需要把内部img的transform进行合并
        miniImgWrapperRef.value.style.transform =
          miniImgWrapperStyleTransform === 'none'
            ? miniImgStyleTransform
            : miniImgWrapperStyleTransform.concat(' ', miniImgStyleTransform)
      }
      return
    }
    // 播放暂停了
    //miniImgWrapperRef
    // miniImgRef
    const style = getComputedStyle(picBoxImgRef.value)
    const picBoxImgRefTransform = style.transform
    const picBoxRefTransform = getComputedStyle(picBoxRef.value).transform
    picBoxRef.value.style.transform =
      picBoxRefTransform === 'none'
        ? picBoxImgRefTransform
        : picBoxRefTransform.concat(' ', picBoxImgRefTransform)
  }
  await nextTick()
  songNameSwipe.value.resize()
  //console.log(songNameSwipe.value, "songNameSwipe.value");
  songNameSwipe.value.swipeTo(currentSongIndex.value)
})
//  currentTime值发生了变化
watch(currentTime, async newTime => {
  if (fullScreen.value && !isPlaying.value) {
    store.commit('setPlaying', true)
  }
  // playLyric();
  // stopLyric();
  // console.log("currentTime--------");
  if (isMove.value) {
    return
  }
  progressBarWidth.value =
    Math.min(
      Math.max(0, newTime / currentSong.value.duration),
      currentSong.value.duration
    ) * 100
})

const removeING = ref(false)
let timer = null

async function delSong(song) {
  if (removeING.value) {
    return
  }
  clearTimeout(timer)
  // 删除一首歌曲
  await store.dispatch('delSong', song)
  removeING.value = true
  timer = setTimeout(() => {
    removeING.value = false
  }, 500)
  // song.isDel = true;
}

// 清空mask中播放列表中的歌曲
async function clearPlayList() {
  visible.value = true
  // try {
  //   const result = await Dialog.confirm({
  //     title: "提示",
  //     message: "确认清空播放列表?",
  //   });
  //   playList.value.forEach((item) => {
  //     item.isDel = true;
  //   });
  //   //   store.commit("setPlayList", playList.value);
  // } catch (err) {}
}

// swiper 索引值改变
function onChange(index) {
  // debugger;
  console.log(index, 'index')
}

// 全屏
function fullScreenHandle() {
  store.commit('setFullScreen', true)
}

// 迷你播放器按钮点击事件
function miniPlay() {
  // console.log('miniPlay事件触发了')
  store.commit('setFullScreen', false)
  store.commit('setPlaying', !isPlaying.value)
}

// 滚动中不让歌词进行滚动 锁
const scrollIng = ref(false)

// 歌词点击事件
function lyricTextClick(line, index) {
  //console.log(currentLyric.value.lines[index]);
  if (scrollIng.value) {
    return
  }
  if (cdMovePageX > 0) {
    return
  }
  const time = line.time / 1000
  audioRef.value.currentTime = currentTime.value = time
  playLyric()
  stopLyric()
  currentLyricNum.value = index
}

// 切换播放的模式
function togglePlayMode() {
  const mode = (playMode.value + 1) % 3
  audioRef.value.loop = mode === PLAY_MODE.loop
  store.dispatch('changeMode', mode)
}

// 播放歌词
function playLyric() {
  const currentLyricVal = currentLyric.value
  if (currentLyricVal) {
    currentLyricVal.seek(currentTime.value * 1000)
  }
}

// 暂停播放歌词
function stopLyric() {
  const currentLyricVal = currentLyric.value
  if (currentLyricVal) {
    currentLyricVal.stop && currentLyricVal.stop()
  }
}

// 歌曲播放结束
async function ended() {
  console.log('ended')
  // debugger;
  //currentTime.value = 0;
  //audioRef.value.currentTime = 0;
  songReady.value = true
  //console.log("歌曲播放结束了");
  // console.log(playMode.value, "playMode.valueplayMode.valueplayMode.value");
  if (playMode.value === PLAY_MODE.loop) {
    currentTime.value = 0
    //audioRef.value.currentTime = 0;
    // debugger;
    //如果是单曲循环
    // 设置audio loop循环播放
    await nextTick()
    audioRef.value.loop = true
    // store.commit("setPlaying", true);
    // currentTime.value = 0;
    // audioRef.value.currentTime = 0;
  } else {
    audioRef.value.loop = false
    store.commit('setPlaying', true)
    // 歌曲自然播放结束调用下一首歌曲进行播放
    nextSong()
  }
}

let pageX, rect

// 手指触摸开始
function touchstart(event) {
  stopLyric()
  //console.log(event, "touchstart");
  pageX = event.touches[0].pageX
  rect = event.target.getBoundingClientRect()
}

// 手指移动事件, 还需要去计算歌词
function touchmove(event) {
  //console.log(touchmove, "touchmove");
  isMove.value = true
  //console.log(event, "touchmove");
  pageX = event.touches[0].pageX
  rect = event.target.getBoundingClientRect()
  let distance = Math.floor(pageX - rect.left)
  const width = event.currentTarget.clientWidth
  let value = distance / width
  currentTime.value = Math.min(
    value * currentSong.value.duration,
    currentSong.value.duration
  )
  value *= 100
  stopLyric()
  playLyric()
  stopLyric()
  // console.log(currentSong.value.duration, "currentSong.value.duration");
  //console.log(currentTime, "currentTime////33");
  let v = Math.min(Math.max(value, 0), currentSong.value.duration)
  // console.log(v, "vvvv");
  progressBarWidth.value = v
}

// 手指触摸离开
function touchend(event) {
  //console.log(touchend, "touchend");
  isMove.value = false
  //console.log(event, "touchend");
  //console.log(pageX, "pageX");
  //console.log(rect.left, "left");
  let distance = Math.floor(pageX - rect.left)
  // 进度条的距离
  //console.log(distance, "distance");
  const width = event.currentTarget.clientWidth
  let value = distance / width
  // currentTime.value
  //progressBarWidth.value = distance / 100;
  //console.log(rect, "rect");
  currentTime.value = Math.min(
    value * currentSong.value.duration,
    currentSong.value.duration
  )
  // console.log(currentTime.value, "currentTime.value");
  audioRef.value.currentTime = currentTime.value
  value *= 100
  if (!isPlaying.value) {
    store.commit('setPlaying', true)
  }
  // console.log(currentSong.value.duration, "currentSong.value.duration");
  //console.log(currentTime, "currentTime////33");
  progressBarWidth.value = value
  // ;
  stopLyric()
  playLyric()
}

const playListScrollRef = ref(null)
const playListScrollInstance = ref(null)

function timeupdate(event) {
  if (!isPlaying.value) {
    // 暂停状态
    return
  }
  // 用户手指在拖动
  if (isMove.value) {
    return
  }
  currentTime.value = event.target.currentTime
}

// audio 暂停事件
function pause() {
  stopLyric()
  // console.log(currentSong.value);
  // console.log(currentTime.value);
  // console.log("pause事件执行了");
  //  if (currentSongIndex.value === playList.value.length) {
  //    store.commit("setPlaying", true);
  //    // store.commit("setCurrentIndex", 0);
  //    nextSong();
  //    return;
  //  }
  // 歌曲自然播放完毕结束了
  // if (
  //   Math.floor(currentTime.value) === Math.floor(currentSong.value.duration)
  // ) {
  //   store.commit("setPlaying", true);
  //   // store.commit("setCurrentIndex", 0);
  //   nextSong();
  //   return;
  // }
  store.commit('setPlaying', false)
}

// 上一首
function prevSong() {
  stopLyric()
  // progressBarWidth.value = 0;
  // currentTime.value = 0;
  let index = currentIndex.value
  index--
  if (index < 0) {
    // 如果已经值是-1就跳到最后一首进行播放
    index = songsLength.value - 1
  }
  // 获取当前所在歌曲的索引
  store.commit('setPlaying', true)
  store.commit('setCurrentIndex', index)
}

//下一首
function nextSong() {
  console.log('nextSong')
  stopLyric()
  //  progressBarWidth.value = 0;
  //currentTime.value = 0;
  let index = currentIndex.value
  index++
  if (index === songsLength.value) {
    // 如果越界了就播放到第一手歌曲进行播放
    index = 0
  }
  // 只有一首歌曲的话,就循环播放
  if (songsLength.value === 1) {
    //   console.log(songsLength, "songsLength");
    // await nextTick();
    currentTime.value = 0
    audioRef.value.loop = true
    audioRef.value.play()
    stopLyric()
    playLyric()
  }
  //console.log(index, 'index....结束了')
  // 获取当前所在歌曲的索引
  store.commit('setCurrentIndex', index)
  store.commit('setPlaying', true)
}

function durationchange(event) {
  console.log('durationchange')
  canplayHandle()
  // console.log(event, "event...");
}

function favoriteIconClick(song) {
  //console.log(currentSong.value, "currentSong.value");
  store.commit('toggleFavorite', song)
}

// 歌曲是否喜欢
function isFavorite(song) {
  // debugger;
  const findItem = favoriteSongList.value.find(item => {
    return item.id === song.id
  })
  return findItem ? 'icon-favorite' : 'icon-not-favorite'
}

// 不是全屏播放
function noFullScreen() {
  store.commit('setFullScreen', false)
}

function toggleSongPlay() {
  songReady.value = false
  isUserPause.value = true
  store.commit('setPlaying', !isPlaying.value)
}

// 暴露数据给外部 父组件可以通过ref 获取到组件拿到数据
defineExpose({
  audioRef,
})
</script>

<style lang="scss" scoped>
// 动画
.popup-enter-active,
.popup-leave-active {
  transition: all 0.5s ease;
}

.popup-enter-from,
.popup-leave-to {
  transform: translateY(100%);
}

.popdown-enter-active,
.popdown-leave-active {
  transition: all 1s ease;
}

.popdown-enter-from,
.popdown-leave-to {
  transform: translateY(-100%);
}

.removeING {
  opacity: 0.3;
}

.top-title {
  height: 50px;
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  //line-height: 40px;
  text-align: center;
  background-color: #222222;
  z-index: 999;

  .header {
    box-sizing: border-box;
    position: relative;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;

    .icon-back {
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%) rotate(180deg);
      color: $color-theme;
    }

    .song-name {
      //padding-left: 6px;
      font-size: 14px;
      text-align: center;
      color: #ffffff;
    }

    .singer-name {
      text-align: center;
      font-size: 16px;
      display: inline-block;
      width: 250px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

// 播放进度条区域
.song-play-time-wrapper {
  box-sizing: border-box;
  position: fixed;
  bottom: 100px;
  left: 0;
  width: 100%;
  padding: 10px 20px;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  z-index: 360;
  // background-color: pink;

  .play-time {
    font-size: 12px;
  }

  .song-duration {
    font-size: 13px;
  }

  .progress-wrapper {
    padding: 5px 0;
    //box-sizing: border-box;
    margin: 0 10px;
    flex: 1;

    .van-progress {
      ::v-deep(.van-progress__portion) {
        // position: relative;
        &::after {
          position: absolute;
          content: '';
          right: 0;
          top: 50%;
          transform: translate(50%, -50%);
          display: inline-block;
          width: 10px;
          height: 10px;
          border: 2px solid #fff;
          border-radius: 50%;
          background-color: #ffcd32;
        }
      }
    }
  }
}

// 播放控制器区域
.play-control-wrapper {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  position: fixed;
  width: 100%;
  height: 40px;
  left: 0;
  z-index: 360;
  bottom: 40px;
  color: $color-theme;
  font-size: 30px;
  .play-mode-icon-wrapper {
    @include f-center;
  }
  .is-playing {
    @include f-center;
    i {
      font-size: 38px;
    }
  }
}

.play-music {
  box-sizing: border-box;
  padding-top: 50px;
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: $color-background;
  // z-index: 215;
  z-index: 352;
  //.swiper {
  //  width: 100%;
  //  height: 420px;
  //}

  .cd-swiper-wrapper {
    //  padding-bottom: 40px;
    position: relative;
    overflow: hidden;
  }

  .my-swipe {
    padding-top: 20px;
    padding-bottom: 40px;

    .swiper-wrapper {
      position: relative;
    }

    ::v-deep(.swiper-pagination) {
      .swiper-pagination-bullet {
        background-color: #fff;
        width: 6px;
        height: 6px;
        border: 1px solid transparent !important;
      }
      .swiper-pagination-bullet-active {
        width: 16px;
        border-radius: 5px;
        border: 1px solid transparent !important;
      }
    }

    //::v-deep(.van-swipe__indicators) {
    //  bottom: 10px;
    //  .van-swipe__indicator--active {
    //    width: 10px;
    //    border-radius: 3px;
    //  }
    //}
    .scroll-wrapper {
      overflow: hidden;
      //  background-color: pink;
      .lyric-wrapper {
        margin: 0 60px;
        text-align: center;

        .lyric-text {
          position: relative;
          //background-color: red;
          padding: 5px 0;
          font-size: 14px;
          line-height: 15px;
          color: $color-text-d;

          .lyric-active {
            position: absolute;
            right: 0;
            top: 50%;
            font-size: 10px;
            display: flex;
            justify-content: center;
            align-items: center;
            transform: translateY(-50%);
            width: 50px;
            height: 20px;
            background-color: $color-theme;
            color: #ffffff;
          }

          //&.currentLyricActive {
          //  &::after {
          //    content: "";
          //    right: 0;
          //    top: 50%;
          //    transform: translateY(-50%);
          //    width: 50px;
          //    height: 100%;
          //    background-color: $color-theme;
          //  }
          //}
        }
      }
    }
  }

  //::v-deep(.van-swipe__indicators) {
  //  bottom: -20px;
  //}

  .singer-pic-wrapper {
    .pic-box {
      margin: 15px auto 0;
      width: 300px;
      overflow: hidden;
      border: 10px solid #4e5649;
      border-radius: 50%;

      img {
        border-radius: 50%;
        width: 100%;
        height: 100%;
      }
    }
    //@media screen and (width: 768px) {
    //  .pic-box {
    //    width: 500px;
    //  }
    //}
  }

  .currentLyric-wrapper {
    margin-top: 50px;
    text-align: center;

    .text {
      display: inline-block;
      width: 300px;
      overflow: hidden;
      text-align: center;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 14px;
      color: $color-theme;
    }
  }
}

.mask {
  position: fixed;
  left: 0;
  bottom: 0;
  right: 0;
  top: 0;
  //background-color: red;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 280;
}

.play-list {
  position: fixed;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 20px;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 400px;
  background-color: #333333;
  z-index: 302;

  .header {
    display: flex;
    height: 40px;
    align-items: center;

    .left-box {
      i {
        font-size: 20px;
        color: $color-theme;
      }
    }

    .middle-box {
      margin-left: 10px;
      flex: 1;

      .text {
        font-size: $font-size-medium;
        color: $color-text-d;
      }
    }

    .right-box {
      .clear-icon-wrapper {
        i {
          color: $color-text-d;
        }
      }
    }
  }

  .play-list-scroll-wrapper {
    flex: 1;
    overflow: hidden;

    .play-list-item-wrapper {
      .play-list-item {
        position: relative;
        box-sizing: border-box;
        padding-left: 15px;
        display: flex;
        align-items: center;
        height: 30px;

        .playing-icon-wrapper {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          left: 0;

          .icon-play {
            font-size: 12px;
            color: $color-theme;
          }
        }

        .song-name {
          padding-left: 6px;
          flex: 1;
          font-size: $font-size-medium;
          color: $color-text-d;
        }

        .right-control {
          .icon-wrapper {
            box-sizing: border-box;
            padding-left: 10px;
            display: flex;
            justify-content: space-between;
            width: 60px;

            .favorite-btn {
              color: $color-theme;
            }

            .close-btn {
              color: $color-theme;
            }
          }
        }
      }
    }
  }

  .add-song {
    padding: 20px;
    margin: 0 auto;

    > div {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 8px 20px;
      font-size: 12px;
      color: $color-text-d;
      border: 1px solid $color-text-d;
      border-radius: 10px;

      > img {
        margin-right: 4px;
      }

      > span {
        margin-left: 5px;
      }
    }
  }

  .button-close {
    position: fixed;
    left: 0;
    width: 100%;
    bottom: 0;
    text-align: center;
    line-height: 30px;
    background-color: #222222;
    font-size: 12px;
    color: $color-text-d;
  }
}

.mini-play-wrapper {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 60px;
  background-color: #333333;
  z-index: 210;

  .mini-play-content {
    padding: 0 10px;
    box-sizing: border-box;
    height: 100%;
    display: flex;
    align-items: center;

    .img-wrapper {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid #4e5649;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }

    .song-name-wrapper {
      height: 100%;
      margin-left: 15px;
      overflow: hidden;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;

      .song-name-swipe {
        width: 100%;
        height: 100%;

        .van-swipe-item {
          display: flex;
          flex-direction: column;
          justify-content: space-evenly;
        }
      }

      .song-name {
        font-size: $font-size-medium;
      }

      .singer-name {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: $font-size-small;
        color: $color-text-d;
      }
    }

    .icon-control-wrapper {
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      height: 100%;
      width: 100px;

      .icon-play-progress {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        height: 100%;
        width: 100px;
        // background-color: red;
        .circle {
          position: absolute;
          z-index: 400;
          left: 50%;
          top: 50%;
          transform: translate3d(-50%, -50%, 0);
        }

        //i {
        //  z-index: 399;
        //  position: absolute;
        //  left: 50%;
        //  top: 50%;
        //  transform: translate3d(-50%, -50%, 0);
        //  font-size: 30px;
        //}
      }

      .control-play {
        position: absolute;
        z-index: 400;
        left: 50%;
        top: 50%;
        width: 12px;
        height: 12px;
        transform: translate3d(-50%, -50%, 0);
        //font-size: 30px;
        //  color: $color-theme;
      }

      .icon-playlist {
        font-size: 26px;
        color: $color-theme;
      }
    }
  }
}
</style>
