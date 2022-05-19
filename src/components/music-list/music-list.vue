<template>
  <div class="music-list" ref="musicListRef">
    <header
      class="header"
      ref="headerRef"
      :style="[{ zIndex: headerZIndex }, headerBgColor]"
    >
      <i class="iconfont icon-back" @click="$router.back()"></i>
      <span class="title">{{ currentSingerInfo.title }}</span>
    </header>
    <div
      class="img-wrapper"
      ref="imgWrapperRef"
      :style="[
        { backgroundImage: `url(${currentSingerInfo.pic})` },
        imgWrapperScale,
      ]"
    >
      <div class="filter" :style="filterStyle"></div>
      <div class="random-play-all" @click.stop="randomPlay">
        <i class="iconfont icon-play"></i>
        <span>随机播放一首歌曲</span>
      </div>
    </div>
    <div class="play-list" :style="[{ top: playListTop + 'px' }]">
      <div class="play-list-wrapper">
        <div
          class="scroll-wrapper"
          ref="scrollRef"
          :style="[{ height: scrollWrapperHeight + 'px' }]"
        >
          <!--:style="isPaddingBottom"-->
          <div class="list-content" :style="[isPaddingBottom]">
            <div
              class="list-item"
              v-for="(song, index) of currentSingerInfo.songs"
              :key="song.id"
              @click="selectSong(song)"
            >
              <!--              {{ song }}-->
              <div class="icon-wrapper">
                <img
                  v-if="index < 3"
                  :src="require(`@/assets/images/icon${index}.png`)"
                />
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div class="song-desc">
                <p class="song-name">{{ song.name }}</p>
                <p class="song-singer">
                  <span>
                    {{ song.singer }}
                  </span>
                </p>
              </div>
              <div class="tools-wrapper">
                <tools @next-play="nextPlay(song)"></tools>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  defineProps,
  ref,
  defineEmits,
  onMounted,
  nextTick,
  onUnmounted,
  computed,
  watch,
} from 'vue'
import { SINGER_KEY } from '@/assets/js/constant'
import BScroll from 'better-scroll'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import storage from 'storejs'

import { throttle } from 'throttle-debounce'

import tools from '@/components/tools/tools.vue'

const emits = defineEmits(['selectSong', 'nextPlay'])
const scrollInstance = ref(null)
const scrollRef = ref(null)
const scrollWrapperHeight = ref(0)
const imgWrapperRef = ref(0)
const imgWrapperHeight = ref(0)
const musicListRef = ref(0)
const playListTop = ref(0)
// header区域对应的ref
const headerRef = ref(null)
const headerHeight = ref(0)
const headerZIndex = ref(1)
const imgWrapperScale = ref({})
const filterStyle = ref({})
const router = useRouter()
const route = useRoute()

const headerBgColor = ref({})

const props = defineProps({
  pic: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  songs: {
    type: Array,
    default: () => [],
  },
})

const currentSingerInfo = computed(() => {
  return store.state.currentSingerInfo
})

//console.log(currentSingerInfo, "currentSingerInfo-store");

const singerInfo = computed(() => {
  const cacheData = storage.get(SINGER_KEY)
  // console.log(cacheData, "cacheData-singerInfo");
  let res = {}
  if (props.title) {
    res.title = props.title || cacheData.title
  }
  if (props.pic) {
    res.pic = props.pic || cacheData.pic
  }
  if (props.songs && props.songs.length > 0) {
    res.songs = props.songs || cacheData.songs
  }
  return res
})

onUnmounted(() => {
  // console.log("onUnmounted");
  // 页面离开的时候清除掉
  //sessionStorage.removeItem(SINGER_KEY);
})

// const headerBgColor = computed(() => {
//   return headerZIndex.value > 1
//     ? {
//         backgroundColor: `#222222`,
//         transition: `all .3s`,
//       }
//     : {
//         backgroundColor: `transparent`,
//         transition: `all .3s`,
//       };
// });

const fullScreen = computed(() => store.state.fullScreen)

// scroll 滚动的距离
const scrollY = ref(0)
const store = useStore()

const cacheData = storage.get(SINGER_KEY)
//console.log(cacheData, "cacheData++++");
// if (cacheData && cacheData.pic && cacheData.title && cacheData.songs.length) {
//   pic.value = cacheData.pic;
//   title.value = cacheData.title;
//   songs.value = cacheData.songs;
// }

// const pic = ref("");
// const title = ref("");
// const songs = ref([]);

// 添加到下一首歌曲
function nextPlay(song) {
  store.commit('addSongNextPlay', song)
  emits('nextPlay')
  //console.log(song, "next-play");
}

watch(fullScreen, async newFullScreen => {
  // 非全屏的状态,我们需要让scroll重新计算高度
  await nextTick()
  scrollInstance.value.refresh()
})

const scrollWatchHandle = newScrollY => {
  // console.log("滚动了");
  //console.log(newScrollY, "newScrollY");
  let scrollY = 0
  let imgWrapperHeightValue = imgWrapperHeight.value
  // 用户向上滚动
  if (newScrollY < 0) {
    let v = -Math.min(newScrollY, imgWrapperHeight.value)
    //console.log(v, "vv");
    //console.log(v / imgWrapperHeight.value, "v / imgWrapperHeight.value");
    let blur = (v / imgWrapperHeight.value) * 20
    scrollY = Math.abs(newScrollY)
    let value = scrollY - imgWrapperHeightValue
    // console.log(value, "value");
    // console.log(Math.abs(value), "valuevalue");
    // console.log(blur, "blurblurblurblur");
    if (value <= 0) {
      scrollY = Math.abs(scrollY - imgWrapperHeightValue)
      // console.log(scrollY, "scrollY");
      // console.log(headerHeight.value, "headerHeight.value");
      if (scrollY <= headerHeight.value) {
        //   console.log(scrollY, "小于header的高度");
        // 那么就让头部层级变高
        headerZIndex.value = 10
        headerBgColor.value = {
          backgroundColor: `#222222`,
          transition: `all .3s`,
        }
      } else {
        headerZIndex.value = 1
        headerBgColor.value = {
          backgroundColor: `transparent`,
          transition: `all .3s`,
        }
        //filterStyle.value = {};
      }
    }
    // console.log(blur, "blur");
    filterStyle.value = {
      backdropFilter: `blur(${blur}px)`,
      //filter: `blur(${blur}px)`,
    }
    //   console.log(filterStyle.value, "filterStyle.value");
  } else {
    // console.log("用户向下滚动");
    let scroll = newScrollY
    scroll = Math.max(Math.min(scroll, imgWrapperHeight.value), 0)
    let val = scroll / imgWrapperHeight.value
    //console.log(val, "valvalvalvalval");
    // console.log(`scale(${1 + val})`, "scale");
    imgWrapperScale.value = {
      transform: `scale(${1 + val}) translateZ(0px)`,
    }
  }
}

watch(scrollY, scrollWatchHandle)
watch(props.songs, async newSongs => {
  if (newSongs && newSongs.length > 0) {
    await nextTick()
    scrollInstance.value.refresh()
  }
})

// 随机播放全部
function randomPlay() {
  store.commit('setPlayList', props.songs)
  store.commit('setSequenceList', props.songs)
  store.dispatch('randomPlay', {
    list: props.songs,
  })
}

function selectSong(song) {
  // console.log(song);
  // debugger;
  // store.commit("addRecentlyPlaySong", song);
  emits('selectSong', song)
}

//scroll 滚动事件回调函数
function scrollHandle(pos) {
  // console.log("scroll了", pos.y);
  scrollY.value = pos.y
  //console.log(pos.y, "pos.y");
  //console.log(pos, "possss");
}

onUnmounted(() => {
  // console.log(props, "props....");
  // console.log("onUnmounted执行了");
  scrollInstance.value = null
})

onMounted(async () => {
  // console.log(route, "useRoute");
  await nextTick()
  const cacheData = storage.get(SINGER_KEY)
  // console.log(cacheData, "cacheData333");
  // if (cacheData && cacheData.pic && cacheData.title && cacheData.songs.length) {
  //   pic.value = cacheData.pic;
  //   title.value = cacheData.title;
  //   songs.value = cacheData.songs;
  // } else {
  //   const path = route.matched[0].path;
  //   //console.log(path, "ppp");
  //   router.replace({
  //     path,
  //   });
  //   return;
  // }
  await nextTick()
  headerHeight.value = headerRef.value.clientHeight
  //console.log(headerHeight.value, "headerHeight.valueheaderHeight.value");
  // 获取图片区域的高度
  let imgClientHeight = imgWrapperRef.value.clientHeight
  // console.log(imgClientHeight, "imgClientHeightimgClientHeight");
  imgWrapperHeight.value = imgClientHeight
  playListTop.value = imgClientHeight
  scrollWrapperHeight.value = musicListRef.value.clientHeight - imgClientHeight
  scrollInstance.value = new BScroll(scrollRef.value, {
    observeDOM: true,
    click: true,
    // 实时派发滚动事件
    probeType: 3,
  })
  scrollInstance.value.on('scroll', scrollHandle)
  //  console.log(scrollInstance.value, "scrollInstance.value");
  //console.log(props.songs, "o");
})
</script>

<style lang="scss" scoped>
.music-list {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;

  .header {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    text-align: center;
    line-height: 40px;
    // z-index: 6;
    .icon-back {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      left: 15px;
      color: $color-theme;
    }
  }

  .img-wrapper {
    position: relative;
    height: 260px;
    background-size: cover;

    .filter {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      //background-color: red;
      background: rgba(7, 17, 27, 0.4);
      // z-index: 400;
    }

    .random-play-all {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      bottom: 20px;
      border: 1px solid $color-theme;
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 14px;
      color: $color-theme;

      .icon-play {
        vertical-align: middle;
      }

      span {
        margin-left: 5px;
        vertical-align: middle;
      }
    }
  }

  .play-list {
    flex: 1;
    box-sizing: border-box;
    position: absolute;
    width: 100%;
    left: 0;
    // overflow: hidden;
    .play-list-wrapper {
      box-sizing: border-box;

      .scroll-wrapper {
        box-sizing: border-box;
        height: 100%;

        .list-content {
          box-sizing: border-box;
          background-color: #222222;
          padding: 15px 30px 15px 30px;
          .list-item {
            display: flex;

            .icon-wrapper {
              margin-right: 15px;
              display: flex;
              justify-content: center;
              align-items: center;

              img {
                width: 24px;
              }

              span {
                display: inline-block;
                width: 24px;
                text-align: center;
                color: $color-theme;
              }
            }

            .song-desc {
              height: 60px;
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: space-evenly;

              .song-singer {
                text-align: left;

                span {
                  font-size: 12px;
                  display: inline-block;
                  width: 250px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  color: $color-text-d;
                }
              }

              .song-name {
                font-size: 14px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
