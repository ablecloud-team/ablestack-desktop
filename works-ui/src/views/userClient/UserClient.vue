<template>
  <transition name="header">
    <div class="header-panel">
      <a-button class="setting-btn" @click="showDrawer">
        <template #icon>
          <CaretDownFilled />
        </template>
        <!-- {{ipAddress}} -->
      </a-button>
    </div>
  </transition>
  <a-drawer placement="top" :closable="false" :height="drawerHeight" :visible="showDrawerVisible" @close="closeDrawer">
    <UserClientSetting
      ref="userClientSetting"
      :client="client"
      :display="display"
      :mouse="mouse"
      :keyboard="keyboard"
      :token="token"
      @inputModeChange="inputModeChange"
      @mouseModeChange="mouseModeChange"
    />
  </a-drawer>
  <!-- <div ref="viewport" id="viewport" style="position: relative"> -->
  <div id="display" class="display"></div>
  <div v-show="inputText" id="inputText" class="inputText">
    <a-row type="flex" justify="center">
      <a-col flex="1 1 10px">
        <div class="sent-history">
          <div class="sent-text">{{ inputTextValDisplay }}</div>
        </div>
        <a-textarea
          v-model:value="inputTextVal"
          id="inputTextTarget"
          autocorrect="off"
          autocapitalize="off"
          autofocus
          :rows="1"
          class="input-text-target"
          @change="inputTextChange()"
        />
      </a-col>
      <a-col flex="0 1 270px">
        <a-button id="ctrl" @click="ctrlPressed = !ctrlPressed" class="button-stickey" :style="ctrlPressed ? altCtrlStyle : ''"> Ctrl </a-button>
        <a-button id="alt" @click="altPressed = !altPressed" class="button-stickey" :style="altPressed ? altCtrlStyle : ''"> Alt </a-button>
        <a-button id="del" @click="sendKeysym(65535)" class="button-stickey"> Del </a-button>
        <a-button id="esc" @click="sendKeysym(65307)" class="button-stickey"> Esc </a-button>
        <a-button id="tab" @click="sendKeysym(65289)" class="button-stickey"> Tab </a-button>
      </a-col>
    </a-row>
  </div>
  <!-- </div> -->

  <div class="modal" v-if="alertShow">
    <a-result :status="resultStatus" :title="title[status]" :sub-title="text[status] || errorMessage">
      <template #icon v-if="spinner">
        <loading-outlined />
      </template>
      <template #extra v-if="ableReconnect">
        <a-button type="primary" @click="connect()">
          {{ $t("label.reconnect") }}
        </a-button>
      </template>
    </a-result>
  </div>

  <!-- <guac-client-modal ref="modal" @reconnect="connect()" /> -->
</template>

<script>
import { defineComponent, ref, h } from "vue";
import Guacamole from "guacamole-common-js";
// import onScreenKeyboardLayout from "@/keyboard-layouts/en-us-qwerty.json";
import encrypt from "@/client/encrypt";
import dis from "@/client/display";
import states from "@/client/states";
import UserClientSetting from "./UserClientSetting.vue";

const hostname = process.env.VUE_APP_API_URL == "" ? window.location.hostname : process.env.VUE_APP_API_URL;
const wsUrl = "ws://" + hostname + ":8081/";
export default defineComponent({
  components: {
    UserClientSetting,
  },
  setup() {
    const showDrawerVisible = ref(true);
    const drawerHeight = ref(120);
    const showDrawer = () => {
      showDrawerVisible.value = true;
    };
    const closeDrawer = () => {
      showDrawerVisible.value = false;
    };
    return {
      showDrawerVisible,
      closeDrawer,
      showDrawer,
      drawerHeight,
    };
  },
  props: {},
  data() {
    return {
      timer1: ref(null),
      display: ref(null),
      cryptKey: "IgmTQVMISq9t4Bj7iRz7kZklqzfoXuq1",
      cryptIv: "zxy0123456789abc",
      client: ref(null),
      keyboard: ref(null),
      mouse: ref(null),
      downloadBlob: ref([]),
      scrollTop: ref(0),
      scrollLeft: ref(0),
      emulateAbsoluteMouse: ref(true),
      localCursor: ref(true),
      scale: ref(0),
      connectionState: ref(states.IDLE),
      errorMessage: ref(""),
      inputText: ref(false),
      inputOsk: ref(false),
      inputTextVal: ref(""),
      altPressed: ref(false),
      ctrlPressed: ref(false),
      delPressed: ref(false),
      dropPending: ref(false),
      altCtrlStyle: {
        backgroundColor: "#40a9ff",
        color: "white",
        border: "1px solid #a3d2f8",
      },
      sentText: ref([]),
      inputTextValDisplay: ref(""),
      arguments: {},
      token: {
        connection: {
          type: "rdp",
          settings: { "ignore-cert": true },
        },
      },
      // ipAddress: hostname,
      alertShow: ref(true),
      resultStatus: ref(null),
      status: ref(null),
      title: {
        CONNECTING: this.$t("message.userdesktop.status.title.connecting"),
        DISCONNECTING: this.$t("message.userdesktop.status.title.disconnecting"),
        DISCONNECTED: this.$t("message.userdesktop.status.title.disconnected"),
        UNSTABLE: this.$t("message.userdesktop.status.title.unstable"),
        WAITING: this.$t("message.userdesktop.status.title.waiting"),
        CLIENT_ERROR: this.$t("message.userdesktop.status.title.clienterror"),
        TUNNEL_ERROR: this.$t("message.userdesktop.status.title.tunnelerror"),
      },
      text: {
        CONNECTING: this.$t("message.userdesktop.status.text.connecting"),
        DISCONNECTING: this.$t("message.userdesktop.status.text.disconnecting"),
        DISCONNECTED: this.$t("message.userdesktop.status.text.disconnected"),
        UNSTABLE: this.$t("message.userdesktop.status.text.unstable"),
        WAITING: this.$t("message.userdesktop.status.text.waiting"),
        CLIENT_ERROR: this.$t("message.userdesktop.status.text.clienterror"),
        TUNNEL_ERROR: this.$t("message.userdesktop.status.text.tunnelerror"),
      },
    };
  },
  created() {},
  mounted() {
    this.connect();
  },
  computed: {
    ableReconnect() {
      return ["DISCONNECTED", "CLIENT_ERROR"].includes(this.status);
    },
    spinner() {
      return ["CONNECTING", "WAITING"].includes(this.status);
    },
  },
  watch: {
    connectionState(state) {
      this.alertShow = true;
      this.alertShowHandle(state, this.errorMessage);
    },
    scrollTop(val) {
      this.appEl.scrollTop = val;
    },
    scrollLeft(val) {
      this.appEl.scrollLeft = val;
    },
    inputText(val) {
      if (val) this.inputTextTarget = document.getElementById("inputTextTarget");
    },
    ctrlPressed(val) {
      if (val) this.keyboard.press(65507);
      else this.keyboard.release(65507);
    },
    altPressed(val) {
      if (val) this.keyboard.press(65513);
      else this.keyboard.release(65513);
    },
    dropPending(val) {
      if (val) this.displayEl.classList.add("drop-pending");
      else this.displayEl.classList.remove("drop-pending");
    },
  },
  methods: {
    connect() {
      this.tunnel = new Guacamole.WebSocketTunnel(wsUrl);
      this.tunnel.onerror = (string) => {
        //this.connectionState = states.TUNNEL_ERROR;
      };
      // tunnel.onstatechange = (state) => {
      //   console.log("tunnel", state);
      //   switch (state) {
      //     case 0:
      //       this.connectionState = states.CONNECTING;
      //       break;
      //     case 1:
      //       this.connectionState = states.CONNECTED;
      //       break;
      //     case 2:
      //       this.connectionState = states.DISCONNECTED;
      //       break;
      //     case 3:
      //       this.connectionState = states.UNSTABLE;
      //       break;
      //   }
      // };
      this.tunnel.onuuid = (string) => {
        console.log(string);
      };
      this.client = new Guacamole.Client(this.tunnel);
      this.client.onerror = (error) => {
        this.client.disconnect();
        this.errorMessage = error.message;
        this.connectionState = states.CLIENT_ERROR;
      };
      this.client.onstatechange = (state) => {
        // console.log("client", state);
        switch (state) {
          case 0:
            this.connectionState = states.IDLE;
            break;
          case 1:
            this.connectionState = states.CONNECTING;
            break;
          case 2:
            this.connectionState = states.WAITING;
            break;
          case 3:
            this.connectionState = states.CONNECTED;
            break;
          case 4:
            this.connectionState = states.DISCONNECTING;
            break;
          case 5:
            this.connectionState = states.DISCONNECTED;
            break;
        }
      };
      this.client.onsync = () => {};
      this.display = this.client.getDisplay();
      this.appEl = document.getElementById("app");
      this.displayEl = document.getElementById("display");
      this.inputTextEl = document.getElementById("inputText");

      if (this.displayEl !== null) this.displayEl.innerHTML = "";
      this.displayEl.appendChild(this.display.getElement());

      //display 현재 창 크기로 적용
      const browerSize = dis();
      this.token.connection.settings.width = browerSize[0];
      this.token.connection.settings.height = browerSize[1];
      this.token.connection.settings.dpi = browerSize[2];

      //파라미터로 넘어온 값 파라미터값 복호화
      const cipher = this.$CryptoJS.AES.decrypt(atob(this.$route.params.crypto), this.$CryptoJS.enc.Utf8.parse(this.cryptKey), {
        iv: this.$CryptoJS.enc.Utf8.parse(this.cryptIv), // [Enter IV (Optional) 지정 방식]
        padding: this.$CryptoJS.pad.Pkcs7,
        mode: this.$CryptoJS.mode.CBC, // [cbc 모드 선택]
      });
      const decrypted = cipher.toString(this.$CryptoJS.enc.Utf8);
      // console.log('decrypted :>> ', decrypted);
      //복호화 한 값 JSON 형식으로 변경 후 키,값 구분하여 token에 세팅
      const query = JSON.parse(decrypted);
      for (const key in query) {
        this.token.connection.settings[key] = query[key];
      }

      if (
        Math.floor(Date.now() / 1000) - parseInt(this.token.connection.settings.timestamp) >
        30
        //30초로 변경 예정
      ) {
        this.connectionState = states.DISCONNECTED;
      } else {
        this.client.connect("token=" + encrypt(this.token));
      }

      // this.client.onargv = (stream, mimetype, name) => {
      //   if (mimetype !== "text/plain") return;
      //   const reader = new Guacamole.StringReader(stream);
      //   let value = "";
      //   reader.ontext = (text) => {
      //     value += text;
      //   };
      //   reader.onend = () => {
      //     const stream = this.client.createArgumentValueStream(
      //       "text/plain",
      //       name
      //     );
      //     stream.onack = (status) => {
      //       if (status.isError()) {
      //         return;
      //       }
      //       this.arguments[name] = value;
      //     };
      //   };
      // };

      // this.displayEl.addEventListener("contextmenu", (e) => {
      //   e.stopPropagation();
      //   if (e.preventDefault) {
      //     e.preventDefault();
      //   }
      //   e.returnValue = false;
      // });
      //데스크탑 마우스 설정
      this.sink = new Guacamole.InputSink();
      this.displayEl.appendChild(this.sink.getElement());
      this.keyboard = new Guacamole.Keyboard(this.displayEl);
      this.keyboard.listenTo(this.sink.getElement());

      this.keyboard.onkeydown = (keysym) => {
        if (this.isMenuShortcutPressed(keysym)) {
          this.keyboard.reset();
          setTimeout(() => {
            this.showDrawer();
          }, 100);
        }
        this.client.sendKeyEvent(1, keysym);
      };
      this.keyboard.onkeyup = (keysym) => {
        this.client.sendKeyEvent(0, keysym);
      };

      this.touch = new Guacamole.Touch(this.displayEl);
      this.touchScreen = new Guacamole.Mouse.Touchscreen(this.displayEl);
      // this.touchScreen.onmousedown = (state) => {
      //   // console.log(this.display.getWidth(), this.display.getHeight());
      //   // console.log(
      //   //   this.appEl.offsetWidth,
      //   //   this.appEl.offsetHeight
      //   // );
      // };
      this.touchPad = new Guacamole.Mouse.Touchpad(this.displayEl);

      this.mouse = new Guacamole.Mouse(this.displayEl);
      this.mouse.onmouseout = (e) => {
        if (!this.display) return;
        this.display.showCursor(false);
      };

      //this.mouse.on("mousedown", document.body.focus.bind(document.body));
      this.mouse.onEach(["mousedown", "mousemove", "mouseup"], (event) => {
        if (!this.client || !this.display) return;
        event.stopPropagation();
        event.preventDefault();
        // Send mouse state, show cursor if necessary
        this.display.showCursor(this.localCursor);
        this.client.sendMouseState(event.state, true);
      });
      this.mouse.onmousedown = (e) => {
        this.displayEl.focus();
        if (this.inputTextTarget !== undefined) this.inputTextTarget.blur();
        // console.log(this.display.getWidth(), this.display.getHeight());
        // console.log(this.appEl.offsetWidth, this.appEl.offsetHeight);
        // this.resizeWindowEvent();
      };
      this.display.onresize = (x, y) => {
        //console.log(this.appEl.offsetWidth, this.appEl.offsetHeight);
        // console.log("Display 리사이즈 하고난 후 사이즈 :::::::: ", x, y);
        //this.client.sendSize(x, y);
        //this.resize();
      };

      this.displayEl.addEventListener("dragenter", (e) => {
        this.notifyDragStart(e);
      });
      this.displayEl.addEventListener("dragover", (e) => {
        this.notifyDragStart(e);
      });
      this.displayEl.addEventListener("dragleave", (e) => {
        this.notifyDragEnd(e);
      });

      // File drop event handler
      this.displayEl.addEventListener("drop", (e) => {
        this.notifyDragEnd(e);

        // Ignore file drops if no attached client
        if (!this.client) return;

        const dragDropFileList = e.dataTransfer.files;
        for (let i = 0; i < dragDropFileList.length; i++) {
          this.dropUploadFile(dragDropFileList[i], true);
        }
      });

      //파일 다운로드 이벤트 발생 시
      this.client.onfile = (stream, mimetype, filename) => {
        if (this.token.connection.settings["enable-drive"] === "false" || this.token.connection.settings["disable-download"] === "true") {
          this.$message.error(this.$t("message.file.download.permission.denied"));
          return false;
        }
        // console.log("Stream: ", stream);
        // console.log("Mime type: ", mimetype);
        // console.log("File name: ", filename);

        // 서버에 ack 정보 호출 하여 받겠다는 신호 주기
        // stream.sendAck("OK", Guacamole.Status.Code.SUCCESS);
        stream.sendAck("onfile_start_OK", Guacamole.Status.Code.SUCCESS);

        const dur = new Guacamole.DataURIReader(stream, mimetype);
        const arrAsync = [];
        const br = new Guacamole.BlobReader(stream, mimetype);
        const key = filename;
        br.onprogress = (length) => {
          this.$notification.open({
            key,
            message: this.$t("label.file.download"),
            description: "[" + this.$refs.userClientSetting.bytesToSize(br.getLength()) + "] " + filename,
            placement: "bottomRight",
            duration: 0,
            style: {
              width: "400px",
            },
            onClose: () => {
              this.$notification.close(key);
            },
          });
          stream.sendAck("onfile_Received", Guacamole.Status.Code.SUCCESS);
        };

        br.onend = () => {
          console.log("000000000 :>> " + new Date());

          const url = URL.createObjectURL(br.getBlob());
          arrAsync.push(this.downloadFile(url, filename));
          console.log("11111111111111 :>> " + new Date());
          Promise.all(arrAsync)
            .then(() => {
              this.$notification.open({
                key,
                message: this.$t("label.file.download"),
                description: "[" + this.$t("label.complete") + "] " + filename,
                placement: "bottomRight",
                duration: 5,
                style: {
                  width: "400px",
                },
                onClose: () => {
                  this.$notification.close(key);
                },
              });
            })
            .catch((error) => {
              console.log("error :>> ", error);
            })
            .finally(() => {});
        };

        ///////////////////////////////////////////////////////////////////////
        // const arrayBufferReader = new Guacamole.ArrayBufferReader(stream);
        // var chunks = [];
        // var siz = 0;
        // const key = filename;
        // // stream buffer 데이터 받음
        // arrayBufferReader.ondata = (buffer) => {
        //   const bufBlob = new Blob([buffer], { type: mimetype });
        //   chunks.push(bufBlob);

        //   siz = siz + bufBlob.size;

        //   // console.log(this.bytesToSize(siz), chunks.length);
        //   this.$notification.open({
        //     key,
        //     message: this.$t("label.file.download"),
        //     description:
        //       "[" +
        //       this.$refs.userClientSetting.bytesToSize(siz) +
        //       "] " +
        //       filename,
        //     placement: "bottomRight",
        //     duration: 0,
        //     style: {
        //       width: "400px",
        //     },
        //     onClose: () => {
        //       this.$notification.close(key);
        //     },
        //   });

        //   stream.sendAck("OK", Guacamole.Status.Code.SUCCESS);
        // };

        // //stream 이 끝났을 시
        // arrayBufferReader.onend = () => {
        //   this.$notification.open({
        //     key,
        //     message: this.$t("label.file.download"),
        //     description: "[" + this.$t("label.complete") + "] " + filename,
        //     placement: "bottomRight",
        //     duration: 5,
        //     style: {
        //       width: "400px",
        //     },
        //     onClose: () => {
        //       this.$notification.close(key);
        //     },
        //   });
        //   console.log("chunks :>> ", chunks);
        //   const blob = new Blob(chunks, { type: mimetype });
        //   console.log("111111111 :>> " + blob);
        //   const url = URL.createObjectURL(blob);
        //   console.log('url :>> ', url);
        //   this.$refs.userClientSetting.downloadFile(url, filename);
        // };
      };
      this.client.onfilesystem = (object, name) => {
        // Init new filesystem object
        const managedFilesystem = {
          client: this.client,
          object: object,
          name: name,
          root: {
            mimetype: Guacamole.Object.STREAM_INDEX_MIMETYPE,
            streamName: Guacamole.Object.ROOT_STREAM,
            type: "DIRECTORY",
          },
        };
        this.$refs.userClientSetting.updateDirectory(managedFilesystem, managedFilesystem.root);
      };
      window.addEventListener("resize", (e) => {
        // console.log(
        //   "window resize 이벤트 발생 후 바로 크기 :::::: ",
        //   e.target.innerWidth,
        //   e.target.innerHeight
        // );
        this.resizeWindowEvent();
      });
      this.inputModeChange(false);
      this.mouseModeChange(this.emulateAbsoluteMouse);
      this.setDefaultScale();
    },
    downloadFile(url, filename) {
      return new Promise((resolve, reject) => {
        console.log("1:::::::::::::::" + new Date());
        console.log("url :>> ", url + new Date());

        const downlink = document.createElement("a");
        downlink.setAttribute("href", url);
        downlink.setAttribute("download", filename);
        downlink.style.display = "none";
        document.body.appendChild(downlink);
        downlink.click();
        document.body.removeChild(downlink);
        resolve("성공");
      });
    },
    isMenuShortcutPressed(keysym) {
      //console.log("isMenuShortcutPressed", keysym);
      const SHIFT_KEYS = ["65505", "65506"];
      const ALT_KEYS = ["65513", "65514", "65027", "65511", "65512"];
      const CTRL_KEYS = ["65507", "65508"];
      //F12 = ["65481"],
      const MENU_KEYS = [
        "65505",
        "65506",
        "65507",
        "65508",
        "65511",
        "65512",
        "65513",
        "65514",
        //"65481",
      ];
      // Ctrl+Alt+Shift has NOT been pressed if any key is currently held
      // down that isn't Ctrl, Alt, or Shift
      if (!MENU_KEYS.includes(keysym.toString())) return false;

      //console.log("::::::::::::::::::::::", Object.keys(this.keyboard.pressed));
      const arr = Object.keys(this.keyboard.pressed);

      return !!(
        SHIFT_KEYS.filter((x) => arr.includes(x)).length > 0 &&
        ALT_KEYS.filter((x) => arr.includes(x)).length > 0 &&
        CTRL_KEYS.filter((x) => arr.includes(x)).length > 0
      );
    },
    inputModeChange(inputMethod) {
      this.closeDrawer();

      if (inputMethod === false) {
        // this.inputOsk = false;
        this.inputText = false;
      } else if (inputMethod === true) {
        // this.inputOsk = false;
        this.inputText = true;
      }
      this.resizeWindowEvent();
      //  else if (inputMethod == "osk") { 가상키보드 주석처리
      //   this.inputOsk = true;
      //   this.inputText = false;

      //   var layout = onScreenKeyboardLayout;
      //   this.onScreenKeyboard = new Guacamole.OnScreenKeyboard(layout);
      //   //console.log(this.onScreenKeyboard.getElement());
      //   this.$refs.display.appendChild(this.onScreenKeyboard.getElement());

      //   this.onScreenKeyboard.onkeydown = (keysym) => {
      //     this.client.sendKeyEvent(1, keysym);
      //   };

      //   // Broadcast keydown for each key released
      //   this.onScreenKeyboard.onkeyup = (keysym) => {
      //     this.client.sendKeyEvent(0, keysym);
      //   };
      // }
    },
    mouseModeChange(emulateAbsoluteMouse) {
      this.emulateAbsoluteMouse = emulateAbsoluteMouse;
      this.drawerShow = false;
      // this.touch.offEach(
      //   ["touchstart", "touchmove", "touchend"],
      //   this.handleTouchEvent
      // );
      this.touchScreen.offEach(["mousedown", "mousemove", "mouseup"], this.handleEmulatedMouseEvent);
      this.touchPad.offEach(["mousedown", "mousemove", "mouseup"], this.handleEmulatedMouseEvent);

      if (emulateAbsoluteMouse) {
        // this.touch.onEach(
        //   ["touchstart", "touchmove", "touchend"],
        //   this.handleTouchEvent
        // );
        this.touchScreen.onEach(["mousedown", "mousemove", "mouseup"], this.handleEmulatedMouseEvent);

        this.touchScreen.mousedown = (event) => {
          // console.log(event);
          this.resizeWindowEvent();
        };

        var inProgress = false;
        var startX = null;
        var startY = null;
        var currentX = null;
        var currentY = null;
        var deltaX = 0;
        var deltaY = 0;
        this.displayEl.addEventListener(
          "touchmove",
          (e) => {
            if (e.touches.length === 1) {
              // Get touch location
              var x = e.touches[0].clientX;
              var y = e.touches[0].clientY;

              // Init start location and deltas if gesture is starting
              if (!startX || !startY) {
                startX = currentX = x;
                startY = currentY = y;
                deltaX = 0;
                deltaY = 0;
                inProgress = true;
              }

              // Update deltas if gesture is in progress
              else if (inProgress) {
                deltaX = x - currentX;
                deltaY = y - currentY;
                currentX = x;
                currentY = y;
              }

              // Signal start/change in drag gesture
              if (inProgress) {
                this.scrollLeft -= deltaX;
                this.scrollTop -= deltaY;
                e.preventDefault();
              }
            }
          },
          false
        );

        // Reset monitoring and fire end event when done
        this.displayEl.addEventListener(
          "touchend",
          (e) => {
            if (startX && startY && e.touches.length === 0) {
              // Signal end of drag gesture
              if (inProgress) {
                this.scrollLeft -= deltaX;
                this.scrollTop -= deltaY;
                e.preventDefault();
              }

              startX = currentX = null;
              startY = currentY = null;
              deltaX = 0;
              deltaY = 0;
              inProgress = false;
            }
          },
          false
        );
      } else {
        // this.touch.onEach(
        //   ["touchstart", "touchmove", "touchend"],
        //   this.handleTouchEvent
        // );
        this.touchPad.onEach(["mousedown", "mousemove", "mouseup"], this.handleEmulatedMouseEvent);
        // console.log(this.touchPad);
        this.touchPad.mousedown = (event) => {
          // console.log(event);
        };

        // var guacTouchPinch = $scope.$eval($attrs.guacTouchPinch);
        // var element = $element[0];
        // var startLength = null;
        // var currentLength = null;
        // var centerX = 0;
        // var centerY = 0;

        // var pinchDistance = (e) => {
        //   var touchA = e.touches[0];
        //   var touchB = e.touches[1];

        //   var deltaX = touchA.clientX - touchB.clientX;
        //   var deltaY = touchA.clientY - touchB.clientY;

        //   return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        // };

        // var pinchCenterX = (e) => {
        //   var touchA = e.touches[0];
        //   var touchB = e.touches[1];

        //   return (touchA.clientX + touchB.clientX) / 2;
        // };

        // var pinchCenterY = (e) => {
        //   var touchA = e.touches[0];
        //   var touchB = e.touches[1];

        //   return (touchA.clientY + touchB.clientY) / 2;
        // };
        // var clientPinch = (
        //   inProgress,
        //   startLength,
        //   currentLength,
        //   centerX,
        //   centerY
        // ) => {
        //   let initialScale = null;
        //   let initialCenterX = 0;
        //   let initialCenterY = 0;

        //   if (!this.emulateAbsoluteMouse) return false;

        //   // Stop gesture if not in progress
        //   if (!inProgress) {
        //     initialScale = null;
        //     return false;
        //   }

        //   // Set initial scale if gesture has just started
        //   if (!initialScale) {
        //     initialScale = store.state.client.scale;
        //     initialCenterX = (centerX + this.scrollLeft) / initialScale;
        //     initialCenterY = (centerY + this.scrollTop) / initialScale;
        //   }

        //   // Determine new scale absolutely
        //   let currentScale = (initialScale * currentLength) / startLength;

        //   // Fix scale within limits - scroll will be miscalculated otherwise
        //   currentScale = Math.max(
        //     currentScale,
        //     $scope.client.clientProperties.minScale
        //   );
        //   currentScale = Math.min(
        //     currentScale,
        //     $scope.client.clientProperties.maxScale
        //   );

        //   store.state.client.scale = currentScale;

        //   // Scroll display to keep original pinch location centered within current pinch
        //   $scope.client.clientProperties.scrollLeft =
        //     initialCenterX * currentScale - centerX;
        //   $scope.client.clientProperties.scrollTop =
        //     initialCenterY * currentScale - centerY;

        //   return false;
        // };
        // element.addEventListener("touchmove", (e) => {
        //   if (e.touches.length === 2) {
        //     // Calculate current zoom level
        //     currentLength = pinchDistance(e);

        //     // Calculate center
        //     centerX = pinchCenterX(e);
        //     centerY = pinchCenterY(e);

        //     // Init start length if pinch is not in progress
        //     if (!startLength) startLength = currentLength;

        //     // Notify of pinch status

        //     if (
        //       clientPinch(
        //         true,
        //         startLength,
        //         currentLength,
        //         centerX,
        //         centerY
        //       ) === false
        //     )
        //       e.preventDefault();
        //   }
        // });

        // // Reset monitoring and fire end event when done
        // element.addEventListener(
        //   "touchend",
        //   function pinchTouchEnd(e) {
        //     if (startLength && e.touches.length < 2) {
        //       // Notify of pinch end
        //       if (guacTouchPinch) {
        //         $scope.$apply(function pinchComplete() {
        //           if (
        //             guacTouchPinch(
        //               false,
        //               startLength,
        //               currentLength,
        //               centerX,
        //               centerY
        //             ) === false
        //           )
        //             e.preventDefault();
        //         });
        //       }

        //       startLength = null;
        //     }
        //   },
        //   false
        // );
      }
    },
    handleTouchEvent(event) {
      // console.log("handleTouchEvent", event);
      // Do not attempt to handle touch state changes if the client
      // or display are not yet available
      if (!this.client || !this.display) return;
      event.preventDefault();
      // Send touch state, hiding local cursor
      this.display.showCursor(false);
      this.client.sendTouchState(event.state, true);
    },
    handleEmulatedMouseEvent(event) {
      //console.log("handleEmulatedMouseEvent", event);
      if (!this.client || !this.display) return;

      event.stopPropagation();
      event.preventDefault();

      // Ensure software cursor is shown
      this.display.showCursor(true);

      // Send mouse state, ensure cursor is visible
      this.scrollToMouse(event.state);
      this.client.sendMouseState(event.state, true);
    },
    scrollToMouse(mouseState) {
      const main = this.$refs.display;
      if (!main || !main.offsetWidth) {
        return;
      }
      // Determine mouse position within view
      const mouse_view_x = mouseState.x + this.displayEl.offsetLeft - main.scrollLeft;
      const mouse_view_y = mouseState.y + this.displayEl.offsetTop - main.scrollTop;

      // Determine viewport dimensions
      const view_width = main.offsetWidth;
      const view_height = main.offsetHeight;

      // Determine scroll amounts based on mouse position relative to document
      let scroll_amount_x;
      if (mouse_view_x > view_width) scroll_amount_x = mouse_view_x - view_width;
      else if (mouse_view_x < 0) scroll_amount_x = mouse_view_x;
      else scroll_amount_x = 0;

      let scroll_amount_y;
      if (mouse_view_y > view_height) scroll_amount_y = mouse_view_y - view_height;
      else if (mouse_view_y < 0) scroll_amount_y = mouse_view_y;
      else scroll_amount_y = 0;

      // Scroll (if necessary) to keep mouse on screen.
      main.scrollLeft += scroll_amount_x;
      main.scrollTop += scroll_amount_y;
    },
    resizeWindowEvent() {
      const pixelDensity = window.devicePixelRatio || 1;
      // const width = this.appEl.offsetWidth * pixelDensity;
      // const height = this.appEl.offsetHeight * pixelDensity;

      let width = window.innerWidth * pixelDensity;
      let height = window.innerHeight * pixelDensity;
      if (this.inputText) height -= 32 * window.devicePixelRatio;

      this.client.sendSize(width, height);

      // 세팅 drawer 높이 변경
      console.log('width :>> ', window.innerWidth);
      if (window.innerWidth > 1190) this.drawerHeight = 120;
      else if (window.innerWidth > 715 && window.innerWidth <= 1190) this.drawerHeight = 200;
      else if (window.innerWidth > 500 && window.innerWidth <= 715) this.drawerHeight = 280;
      else this.drawerHeight = 440;

      // if (this.onScreenKeyboard) {
      //   this.onScreenKeyboard.resize(this.$refs.display.offsetWidth);
      // }
    },
    setDefaultScale() {
      setTimeout(() => {
        this.$store.state.client.minScale = Math.min(
          this.appEl.offsetWidth / Math.max(this.display.getWidth(), 1),
          this.appEl.offsetHeight / Math.max(this.display.getHeight(), 1)
        );
        if (this.$store.state.client.minScale < 1) {
          // console.log(window.innerWidth);

          this.display.scale(this.$store.state.client.minScale);
          this.client.sendSize(window.innerWidth, window.innerHeight);
        }

        this.$store.state.client.maxScale = Math.max(this.$store.state.client.minScale, 3);
        if (this.display.getScale() > this.$store.state.client.minScale) this.$store.state.client.scale = this.$store.state.client.minScale;
        else if (this.display.getScale() > this.$store.state.client.maxScale) this.$store.state.client.scale = this.$store.state.client.maxScale;
        else this.$store.state.client.scale = this.$store.state.client.minScale;

        // console.log(
        //   this.display.getScale(),
        //   store.state.client.minScale,
        //   "  :::::::::: ",
        //   store.state.client.maxScale,
        //   store.state.client.scale
        // );
      }, 2000);
    },
    inputTextChange() {
      if (this.composingText) return;

      var i;
      var content = this.inputTextVal;
      var TEXT_INPUT_PADDING = 4;
      var expectedLength = TEXT_INPUT_PADDING * 2;

      // If content removed, update
      if (content.length > 1 && content.length < expectedLength) {
        // Calculate number of backspaces and send
        var backspaceCount = TEXT_INPUT_PADDING - 3;
        for (i = 0; i < backspaceCount; i++) this.sendKeysym(0xff08);

        // Calculate number of deletes and send
        var deleteCount = expectedLength - content.length - backspaceCount;
        for (i = 0; i < deleteCount; i++) this.sendKeysym(0xffff);
      } else {
        this.sendString(content);
      }

      this.resetTextInputTarget(TEXT_INPUT_PADDING);
      //e.preventDefault();

      // 한글 입력인경우
      this.inputTextTarget.addEventListener("compositionstart", (event) => {
        // console.log(`generated characters were: ${event}`, event);
        this.composingText = true;
      });
      this.inputTextTarget.addEventListener("compositionend", (event) => {
        // console.log("한글 입력 :: ", event);
        this.composingText = false;
      });

      this.inputTextTarget.onfocus = (e) => {
        e.preventDefault();
      };
    },
    sendCodepoint(codepoint) {
      if (codepoint === 10) {
        this.sendKeysym(0xff0d);
        return;
      }

      var keysym = this.keysymFromCodepoint(codepoint);
      if (keysym) {
        this.sendKeysym(keysym);
      }
    },
    keysymFromCodepoint(codepoint) {
      // Keysyms for control characters
      if (codepoint <= 0x1f || (codepoint >= 0x7f && codepoint <= 0x9f)) return 0xff00 | codepoint;

      // Keysyms for ASCII chars
      if (codepoint >= 0x0000 && codepoint <= 0x00ff) return codepoint;

      // Keysyms for Unicode
      if (codepoint >= 0x0100 && codepoint <= 0x10ffff) return 0x01000000 | codepoint;

      return null;
    },
    sendString(content) {
      var sentText = "";
      // Send each codepoint within the string
      for (var i = 0; i < content.length; i++) {
        var codepoint = content.charCodeAt(i);
        if (codepoint !== 0x200b) {
          sentText += String.fromCharCode(codepoint);
          this.sendCodepoint(codepoint);
        }
      }
      // // Display the text that was sent
      this.sentText.push(sentText);

      // // Remove text after one second
      this.inputTextValDisplay = Object.values(this.sentText).join(""); //시간차때문 먼저 입력필요
      setTimeout(() => {
        this.sentText.shift();
        this.inputTextValDisplay = Object.values(this.sentText).join("");
        // console.log(
        //   "this.sentText :: " + this.sentText,
        //   "this.inputTextValDisplay :: " + this.inputTextValDisplay
        // );
      }, 1000);
    },
    sendCodepoint(codepoint) {
      if (codepoint === 10) {
        this.sendKeysym(0xff0d);
        this.releaseStickyKeys();
        return;
      }

      var keysym = this.keysymFromCodepoint(codepoint);
      if (keysym) {
        this.sendKeysym(keysym);
        this.releaseStickyKeys();
      }
    },
    sendKeysym(keysym) {
      // console.log("keysym ::: " + keysym);
      this.releaseStickyKeys();
      this.client.sendKeyEvent(1, keysym);
      this.client.sendKeyEvent(0, keysym);
    },
    releaseStickyKeys() {
      // Reset all sticky keys
      this.altPressed = false;
      this.ctrlPressed = false;
    },
    resetTextInputTarget(padding) {
      var paddingChar = String.fromCharCode(0x200b);
      this.inputTextVal = new Array(padding * 2 + 1).join(paddingChar);
      this.inputTextTarget.focus();
      this.inputTextTarget.setSelectionRange(padding, padding);
    },
    alertShowHandle(state, message) {
      // console.log(state, message);
      this.status = state;
      switch (state) {
        case states.CONNECTING:
          this.resultStatus = "info";
          break;
        case states.WAITING:
          this.resultStatus = "info";
          break;
        case states.CONNECTED:
          this.alertShow = false;
          this.status = null;
          this.resultStatus = null;
          break;
        case states.DISCONNECTING:
          this.resultStatus = "error";
          break;
        case states.DISCONNECTED:
          this.resultStatus = "error";
          break;
        case states.TUNNEL_ERROR:
          this.resultStatus = "error";
          break;
        case states.CLIENT_ERROR:
          this.resultStatus = "error";
          break;
      }
    },
    dropUploadFile(file, notify) {
      if (this.token.connection.settings["enable-drive"] === "false" || this.token.connection.settings["disable-upload"] === "true") {
        this.$message.error(this.$t("message.file.upload.permission.denied"));
        return false;
      }
      const reader = new FileReader();
      const STREAM_BLOB_SIZE = 6144;
      const key = file.name;

      var managedFileUpload = {};
      reader.onloadend = () => {
        const stream = this.client.createFileStream(file.type, file.name);
        const bytes = new Uint8Array(reader.result);
        let offset = 0;

        managedFileUpload.filename = file.name;
        managedFileUpload.mimetype = file.type;
        managedFileUpload.length = file.size;
        managedFileUpload.notification = notify;

        stream.onack = (status) => {
          if (status.isError()) {
            console.log(status.message);
            return false;
          }
          const sliceBytes = bytes.subarray(offset, offset + STREAM_BLOB_SIZE);
          const base64 = btoa(String.fromCharCode.apply(String, sliceBytes));

          // Write packet
          stream.sendBlob(base64);
          // Advance to next packet
          offset += STREAM_BLOB_SIZE;

          if (offset >= bytes.length) {
            managedFileUpload.progress = 100;
            stream.sendEnd();

            // 업로드 완료 정보 표시를 위한 notification
            if (managedFileUpload.notification) {
              this.$notification.open({
                key,
                message: this.$t("label.file.upload"),
                description: "[" + this.$t("label.complete") + "] " + managedFileUpload.filename,
                placement: "bottomRight",
                duration: 5,
                style: {
                  width: "400px",
                },
                onClose: () => {
                  this.$notification.close(key);
                  managedFileUpload.notification = false;
                },
              });
            }
          } else {
            managedFileUpload.progress = Math.floor((offset / bytes.length) * 100);

            //percent정보 갱신을 위한 notification
            if (managedFileUpload.notification) {
              this.$notification.open({
                key,
                message: this.$t("label.file.upload"),
                description: "[" + managedFileUpload.progress + "%] " + managedFileUpload.filename,
                placement: "bottomRight",
                duration: 0,
                style: {
                  width: "400px",
                },
                // btn: () =>
                //   h(
                //     Button,
                //     {
                //       type: "primary",
                //       size: "small",
                //       onClick: () => {
                //         notification.close(key);
                //         managedFileUpload.notification = false;
                //       },
                //     },
                //     { default: () => this.$t("label.ok") }
                //   ),
                onClose: () => {
                  this.$notification.close(key);
                  managedFileUpload.notification = false;
                },
              });
            }
          }
        };
      };
      // fileReader Call
      reader.readAsArrayBuffer(file);
    },
    sanitizeFilename(filename) {
      return filename.replace(/[\\\/]+/g, "_");
    },
    notifyDragStart(e) {
      e.preventDefault();
      e.stopPropagation();

      this.dropPending = true;
    },
    notifyDragEnd(e) {
      e.preventDefault();
      e.stopPropagation();
      this.dropPending = false;
    },
  },
});
</script>

<style>
@import "../../assets/css/client.css";
</style>
