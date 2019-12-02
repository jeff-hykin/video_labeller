<template>
    <column align-h="left" align-v="top" :class="['panel', { init }]" shadow="2">
        <div>
            <slot name="header" />

            <br /><br /><br /><br />
            <h5>Features</h5>
            <row align-h="space-between" width="100%" padding="1rem 0rem">
                <ui-textbox placeholder="Name of the feature being labelled" v-model="settings.currentFeatureName" />
                <ui-button @click="saveData" class="save-button" color="primary" raised :style="{ marginLeft: '0rem' }">
                    Save
                </ui-button>
            </row>
            
            <slot name="labels" />
            
            <!-- Settings -->
            <br /><br /><br /><br />
            <h5>Settings</h5>
            <column class="settings-bubble bubble" shadow="1" align-h="left">
                <ui-switch v-model="settings.showGraph">
                    Show Graph
                </ui-switch>
                <br />
                <br />
                <ui-radio-group name="Input Mode" :options="modeOptions" v-model="settings.inputMode">
                    Input Mode
                </ui-radio-group>
                <br />
                <br />
                <ui-textbox label="Graph Height" v-model="settings.graphHeight" />
                <br />
                <br />
                <ui-textbox label="Skip Back Amount (Seconds)" v-model="settings.skipBackAmount" />
                <br />
                <br />
                <ui-textbox label="Video Speed Multiplier" v-model="settings.videoSpeedMultiplier" />
                <br />
                <br />
                <ui-textbox label="Number of seconds graph should show" v-model="settings.graphRange" />
            </column>
            <!-- <ui-textbox style="margin-top: 1.5rem" :multi-line="true" label="Videos" v-model="videoList" /> -->
        </div>
    </column>
</template>

<script>
export let settingsPanel

let localSettingsLocation = "videoLabelerSettings"
export default {
    name: "settingsPanel",
    beforeCreate() {
        settingsPanel = this
    },
    data: () => ({
        settings: {
            currentFeatureName: "ExampleFeature1",
            inputMode: "Mouse",
            showGraph: false,
            videoSpeedMultiplier: 1.4,
            skipBackAmount: 5, // seconds
            graphRange: 10, // seconds
            graphHeight: 250, // pixels
        },
        modeOptions: [
            {
                label: "Keyboard",
                value: "Keyboard",
            },
            {
                label: "Mouse",
                value: "Mouse",
            },
        ],
        init: true,
    }),
    mounted() {
        // have an initial value that gets turned to false (for css classes)
        setTimeout(_=>this.init = false, 1300)
        this.loadSettings()
    },
    watch: {
        settings: {
            deep: true,
            handler(val) {
                this.saveSettings()
            },
        },
    },
    methods: {
        saveSettings() {
            window.localStorage.setItem(localSettingsLocation, JSON.stringify(this.settings))
        },
        loadSettings() {
            let settings = window.localStorage.getItem(localSettingsLocation)
            if (typeof settings == "string") {
                let savedSettings = JSON.parse(settings)
                this.settings = { ...this.settings, ...savedSettings }
            }
        },
        saveData(...args) {
            this.$emit("saveData",args)
        }
    },
}
</script>

<style lang="scss" scoped>
.panel {
    position: fixed;
    min-width: 22rem;
    transform: translateX(calc(-100% + var(--unhovered-panel-amount) + 3px));
    transition: all 500ms ease-out;
    background-color: whitesmoke;
    height: 100vh;
    overflow: auto;
    left: 0;
    z-index: 11;
    padding: 2rem 3rem;

    .bubble {
        width: 100%;
        margin-top: 0.8rem;
        padding: 1.5rem;
        border-radius: 1rem;
    }


    .labels-bubble {
        background: white;
    }

    .settings-bubble {
        background: white;
    }
}
.panel.init {
    transform: translateX(0);
}
.panel:hover {
    transform: translateX(0);
}
</style>
