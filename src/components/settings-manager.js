let localSettingsLocation = "videoLabelerSettings"

export default {
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
    }),
    mounted() {
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
    },
}
