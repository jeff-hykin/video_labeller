export default [
    {
        path: "/",
        name: "landing-page",
        component: require("@/components/LandingPage").default,
    },
    {
        path: "*",
        redirect: "/",
    },
]
