<template>
  <!--  <transition name="leave">-->
  <div class="index-list-wrapper" v-show="visible">
    <div
      :class="['index-title', currentIndex === index ? 'active' : '']"
      v-for="(outSinger, index) of singers"
      @click="indexItemClick(index)"
    >
      {{ outSinger.title }}
    </div>
  </div>
  <!--  </transition>-->
  <van-search
    ref="vanSearchCom"
    v-model="singerName"
    placeholder="请输入歌手名称"
    background="#222222"
    @focus="focus"
    @blur="blur"
  >
    <!--show-action-->
    <!--

   -->
    <!--    <template #action>-->
    <!--      <div @click="onClickSearchButton">搜索</div>-->
    <!--    </template>-->
  </van-search>
  <div class="fixedTitle" v-show="scrollY > 0">{{ fixedTitle }}</div>
  <div
    ref="scrollRef"
    style="overflow: hidden"
    :style="{ height: scrollHeight + 'px' }"
  >
    <div class="singer" :style="isPaddingBottom">
      <!--      <div class="fixedTitle" :style="fixedStyle">{{ fixedTitle }}</div>-->
      <div class="singer-content" ref="singerContentRef">
        <template v-for="(outSinger, index) of singers" :key="index">
          <div class="singer-item-wrapper" ref="singerItemWrapperRef">
            <header class="title">{{ outSinger.title }}</header>
            <div
              class="singer-item"
              v-for="(innerSinger, idx) of outSinger.list"
              :key="idx"
              @click.stop="toSingerDetail(innerSinger)"
            >
              <img v-lazy="innerSinger.pic" alt="" />
              <span class="singer-name">{{ innerSinger.name }}</span>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>

  <router-view v-slot="{ Component }">
    <transition name="move">
      <component :is="Component" :pic="pic" :title="title" :songs="songs" />
    </transition>
  </router-view>
</template>

<script>
import { getSingerDetail, getSingerList } from '@/service/singer'
import scroll from '@/components/scroll/scroll'
import storage from 'storejs'
import xss from 'xss'
import { nextTick } from 'vue'
import BScroll from 'better-scroll'
import { SINGER_KEY } from '../../assets/js/constant.js'
import { processSongs } from '../../service/song.js'
export default {
  name: 'Singer',
  components: { scroll },
  data() {
    return {
      visible: true,
      singers: [],
      clientHeights: [],
      scrollY: 0,
      currentIndex: 0,
      fixedStyle: {},
      pic: '',
      title: '',
      songs: [],
      singerName: '',
      // 存储所有的歌手名称
      singerNameList: [],
      scrollHeight: 0,
      scrollInstance: null,
    }
  },

  computed: {
    fixedTitle() {
      if (this.singers.length) {
        return this.singers[this.currentIndex].title
      }
      return ''
    },
  },

  // 组件进入的时候让scroll实例对象重新计算高度
  async activated() {
    await nextTick()
    this.scrollInstance.refresh()
  },
  async created() {
    try {
      let result = await getSingerList()
      //console.log(result, "result");
      this.singers = result.singers
      this.singers.forEach(outer => {
        outer.list.forEach(item => {
          this.singerNameList.push(item.name)
        })
      })
      // console.log(this.singerNameList, "singerNameList");
      //  console.log(this.singers, "this.singers");
      await nextTick()
      // 获取每个item的高度
      const singerItemWrappers = document.querySelectorAll(
        '.singer-item-wrapper'
      )
      let height = 0
      const clientHeights = this.clientHeights
      clientHeights.push(height)
      singerItemWrappers.forEach(ele => {
        height += ele.clientHeight
        clientHeights.push(height)
      })
    } catch (err) {
      console.log(err)
    }
  },

  async mounted() {
    this.scrollInstance = new BScroll(this.$refs.scrollRef, {
      click: true,
      observeDOM: true,
      probeType: 3,
    })
    this.scrollInstance.on('scroll', this.scroll)
    let parentHeight = document.querySelector('.scroll-wrapper').clientHeight
    let scrollHeight = parentHeight - this.$refs.vanSearchCom.$el.clientHeight
    // let height =
    //   this.$refs.scrollRef.rootRef.clientHeight -
    //   this.$refs.vanSearchCom.$el.clientHeight;
    // console.log(height, "height");
    this.scrollHeight = scrollHeight
    // console.log(scrollHeight, "scrollHeight");
    this.$watch('singerName', this.debounce(this.onClickSearchButton, 1000))
  },
  watch: {
    async singers() {
      await nextTick()
      this.scrollInstance.refresh()
    },
    async scrollHeight() {
      await nextTick()
      this.scrollInstance.refresh()
    },
  },
  methods: {
    focus() {
      this.visible = false
    },
    blur() {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.visible = true
      }, 1000)
    },
    debounce(func, delay) {
      this.timer = null
      return function (...args) {
        if (this.timer) clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          func.apply(this, args)
        }, delay)
      }
    },
    onClickSearchButton() {
      this.singerName = xss(this.singerName)
      // console.log(this.singerName, 'this.singerName')
      // console.log(this.singerName, "singerName");
      if (this.singerName.trim().length === 0) {
        // Toast({
        //   icon: "fail",
        //   message: "请输入歌手名称",
        // });
        return
      }
      // console.log(
      //   this.$refs.singerItemWrapperRef,
      //   "this.$refs.singerItemWrapperRef"
      // );
      const childrens =
        this.$refs.singerContentRef.querySelectorAll('.singer-item')
      // console.log();
      //  console.log(childrens, "childrens");
      const singerNameList = this.singerNameList
      try {
        singerNameList.forEach((singerName, index) => {
          if (singerName.includes(this.singerName)) {
            if (index !== 0) {
              index -= 1
            }
            this.scrollInstance.scrollToElement(childrens[index], 300)
            throw new Error('终止运行')
          }
        })
      } catch (err) {
        //  console.log(this.a, "this.athis.a");
      }
      //   console.log("onClickSearchButton");
    },
    async toSingerDetail(innerSinger) {
      //  debugger
      try {
        this.pic = innerSinger.pic
        this.title = innerSinger.name
        const mid = innerSinger.mid
        const result = await getSingerDetail({ mid })
        //    debugger;
        this.songs = await processSongs(result.songs)
        this.$store.commit('setCurrentSingerInfo', {
          title: this.title,
          pic: this.pic,
          songs: this.songs,
        })
        if (this.songs.length && this.pic && this.title) {
          const cacheData = {
            songs: this.songs,
            pic: this.pic,
            title: this.title,
          }
          this.$store.commit('setPlayList', this.songs)
          this.$store.commit('setSequenceList', this.songs)
          console.log('执行了哈')
          localStorage.setItem(SINGER_KEY, JSON.stringify(cacheData))
          //  storage.set(SINGER_KEY, cacheData);
        }

        // await nextTick();
        this.$router.push(`/singer/${mid}`)
        // this.$router.push("/singer-detail?mid=" + innerSinger.mid);
      } catch (err) {
        console.log(err)
      }
    },
    indexItemClick(index) {
      const singerItemWrappers = document.querySelectorAll(
        '.singer-item-wrapper'
      )
      //  const scroll = this.$refs.scrollRef.scroll;
      this.scrollInstance.scrollToElement(singerItemWrappers[index], 300)
    },
    scroll(pos) {
      let fixedTitleHeight = 30 // 30px
      this.scrollY = -pos.y
      //console.log(this.scrollY, "scrollYscrollY");
      for (let i = 0; i < this.clientHeights.length - 1; i++) {
        const prevHeight = this.clientHeights[i]
        const nextHeight = this.clientHeights[i + 1]
        if (this.scrollY >= prevHeight && this.scrollY <= nextHeight) {
          this.currentIndex = i
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.fixedTitle {
  position: fixed;
  top: 120px;
  left: 0;
  padding-left: 15px;
  width: 100%;
  box-sizing: border-box;
  font-size: $font-size-small;
  color: $color-text-d;
  line-height: 30px;
  background-color: $color-highlight-background;
  z-index: 10;
}

::v-deep(.van-search__content) {
  background-color: #333333;

  .van-field__control {
    color: #ffffff;

    &::placeholder {
      color: $color-text-d;
    }

    caret-color: #ffffff;
  }
}

::v-deep(.van-search__action) {
  background-color: #222222;
  color: #ffffff !important;

  div {
    color: #ffffff !important;
  }
}

// 右侧索引导航区域
.index-list-wrapper {
  box-sizing: border-box;
  padding: 15px 5px;
  position: fixed;
  top: 50%;
  right: 0;
  background-color: #242424;
  transform: translateY(-50%);
  z-index: 100;
  border-radius: 10px;

  .index-title {
    margin: 4px 0;
    font-size: $font-size-small;
    text-align: center;

    &.active {
      color: $color-theme;
    }
  }
}

.singer {
  // 头部固定区域
  overflow: hidden;

  .singer-content {
    overflow: hidden;

    .singer-item-wrapper {
      .title {
        box-sizing: border-box;
        font-size: $font-size-small;
        color: $color-text-d;
        padding-left: 15px;
        line-height: 30px;
        background-color: $color-highlight-background;
      }

      .singer-item {
        box-sizing: border-box;
        padding: 15px 25px;

        img {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          vertical-align: middle;
        }

        .singer-name {
          margin-left: 20px;
          font-size: $font-size-medium;
          color: $color-text-d;
        }
      }
    }
  }
}
</style>
