export default [
    {
        path: "/",
        name: "home-page",
        component: require("@/pages/Home").default,
    },
    // all other routes redirect to the home page
    {
        path: "*",
        redirect: "/",
    },
]
