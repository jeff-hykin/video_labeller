<template>
    <column align-h=left align-v=top margin='1rem 5rem'>
        <h4>What does this app do?</h4>
        <p>
            It records the height of your mouse (as a percent) while a video is playing so that you can continuously label a video.
            For example, you could label a video with mouse movements that corrispond to how happy you think the person in the video is.
        </p>
        <h4>How exactly do I use it?</h4>
        <p>
            1. First open up the <code>settings panel</code> all the way over to the &lt;- left (just hover your mouse over it)
        </p>
        <p>
            2. Then add the name of the feature you are labelling
        </p>
        <p>
            3. Open up a video file (bottom bar)
        </p>
        <p>
            4. Use the spacebar to pause/play the video<br>
            (the mouse movements are automatically recorded when the video is playing)
        </p>
        <p>
            5. Press the blue save button to save the data for that video
        </p>
        <h4>How is the data formatted?</h4>
        <p>
            The data is in a JSON format like this.
<pre>
{
    "your-feature-name": [
        // first mouse position
        [
            0.0, // the video time (in seconds)
            0.5  // the mouse position as a percent (this is 50%)
        ],
        // the next mouse movement
        [
            14.2, // the current video time (in seconds)
            0.2   // the mouse position (this is 20% above the bottom)
        ],
        // the next mouse movement
        [
            15.7, // the current video time (in seconds)
            0.3   // the mouse position (this is 30% above the bottom)
        ],
    ]
}
</pre>
        </p>
    </column>
</template>

<script>
export default {

}
</script>

<style>
    pre, code {
        color: var(--pink);
    }
    
    h4 {
        margin-top: 1.8rem;
        margin-bottom: 0.8rem;
    }
</style>