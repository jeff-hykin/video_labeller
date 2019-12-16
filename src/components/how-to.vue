<template>
    <column class=how-to align-h=left align-v=top :wrap='true'>
        <newspaper-layout width='calc(100vw - var(--unhovered-panel-amount))' columnWidth=25rem>
            <!-- What is this app for? -->
            <div class=card>
                <h4>What is this app for?</h4>
                <p>
                    If you need to hand label a video, that is what this app is created for.
                    <br>
                    It lets you record continuous values using either your mouse or keyboard.
                </p>
            </div>
            
            
            <!-- How to use it -->
            <div class=card>
                <h4>How exactly do I use it?</h4>
                <p>
                    1. First open up the <code>settings panel</code> all the way over to the &lt;- left (just hover your mouse over it)
                </p>
                <p>
                    2. Then add the name of the feature you are labelling
                </p>
                <p>
                    3. Open up a video file (at the top of the <code>settings panel</code>)
                </p>
                <p>
                    4. Play the video<br>
                    Mouse movements are automatically recorded when the video is playing<br>
                    Controls:<br>
                    - spacebar: plays/pauses the video<br>
                    - shift + left arrow / a: slows down the video<br>
                    - shift + right arrow / d: speeds up the video<br>
                    - left arrow / a: jumps backwards a few seconds<br>
                    - right arrow / d: jumps forwards a few seconds<br>
                    - up arrow / w: increment the recorded value<br>
                    - down arrow / s: decrement the recorded value<br>
                </p>
                <p>
                    5. Press the blue save button to save the data for that video
                </p>
            </div>
            
        <div class=card>
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
        </div>

        <!-- How to use it -->
        <div class=card>
            <h4>How exactly do I use it?</h4>
            <p>
                1. First open up the <code>settings panel</code> all the way over to the &lt;- left (just hover your mouse over it)
            </p>
            <p>
                2. Then add the name of the feature you are labelling
            </p>
            <p>
                3. Open up a video file (at the top of the <code>settings panel</code>)
            </p>
            <p>
                4. Play the video<br>
                Mouse movements are automatically recorded when the video is playing<br>
                Controls:<br>
                - spacebar: plays/pauses the video<br>
                - shift + left arrow / a: slows down the video<br>
                - shift + right arrow / d: speeds up the video<br>
                - left arrow / a: jumps backwards a few seconds<br>
                - right arrow / d: jumps forwards a few seconds<br>
                - up arrow / w: increment the recorded value<br>
                - down arrow / s: decrement the recorded value<br>
            </p>
            <p>
                5. Press the blue save button to save the data for that video
            </p>
        </div>
        <div class=card>
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
        </div>
        
        </newspaper-layout>
        
    </column>
</template>

<script>
import NewspaperLayout from "./newspaper-layout"
export default {
    components: { NewspaperLayout },
}
</script>

<style lang="scss" scoped>
    .how-to {
        margin: 1rem 5rem;
        min-height: fit-content;
        width: 100%;
        
        pre, code {
            color: var(--pink);
        }
        
        h4 {
            margin-top: 1.8rem;
            margin-bottom: 0.8rem;
        }
        
        .card {
            margin-top: 1.5rem;
            padding: 1.5rem;
            box-shadow: rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 3px 1px -2px, rgba(0, 0, 0, 0.2) 0px 1px 5px 0px;
            background: white;
            border-radius: 1rem;
            max-width: 30rem;
            
            h4 {
                margin-top: 0.8rem;
            }
        }
    }
</style>