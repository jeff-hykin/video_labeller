<template>
    <column class=help-menu align-h=left align-v=top :wrap='true'>
        <newspaperLayout width='100%' :columnStyle="{ width:'25rem', margin: '1rem' }">
            
            
            <!-- What is this app for? -->
            <div class=card>
                <h4>What is this app for?</h4>
                <p>
                    If you need to hand-label a video, that is what this app is created for. It lets you record continuous values using either your mouse or keyboard.
                </p>
            </div>
            
            
            <!-- How to use it -->
            <div class=card>
                <h4>How exactly do I use it?</h4>
                <ol>
                    <li>
                        1. First open up the <code>settings panel</code>
                    </li>
                    <div>
                        It is all the way over to the &lt;- left (just hover your mouse over it)
                    </div>
                    
                    
                    <li>
                        2. Find "Active Label"
                    </li>
                    <div>
                        Change it to be the name of whatever aspect of the video(s) you would like to label.
                    </div>
                    
                    
                    <li>
                        3. Open up a video file
                    </li>
                    <div>
                        (at the top of the <code>settings panel</code>)
                    </div>
                    
                    
                    <li>
                        4. Play the video
                    </li>
                    <div>
                        As soon as the video starts playing, values will be recorded.
                        <br>
                        <br>
                        If you're in <code>keyboard mode</code> you can use the up/down arrow keys to change the recorded value
                        <br>
                        <br>
                        If you're in <code>mouse mode</code> you can use the mouse movement to change the recorded value
                        <br>
                        <br>
                        See the "What are the controls?" for more info on controlling the playback
                    </div>
                    
                    <li>
                        5. Save your changes
                    </li>
                    <div>
                        Use the blue "Save All Changes" button inside of the settings panel
                    </div>
                </ol>
            </div>
            
            <!-- Controls -->
            <div class=card>
                <h4>What are the controls?</h4>
                <br>
                <div>
                    
                    <!-- Directions -->
                    <row transform=scale(0.7)>
                        <column position=relative tran>
                            <keyboardKey name=W />
                            <row>
                                <keyboardKey name=A />
                                <keyboardKey name=S />
                                <keyboardKey name=D />
                            </row>
                        </column>
                        <row
                            color='var(--gray-dark)'
                            background-color=whitesmoke
                            width=fit-content
                            padding=0.28rem
                            border-radius=0.7rem
                            margin=0.7rem
                            font-weight=bold
                            position=relative
                            top=-1rem
                            >
                            OR
                        </row>
                        <column position=relative>
                            <keyboardKey name=↑ />
                            <row>
                                <keyboardKey name=← />
                                <keyboardKey name=↓ />
                                <keyboardKey name=→ />
                            </row>
                        </column>
                    </row>
                    
                    <br>
                    <br>
                    
                    <!-- Key mapping -->
                    <column position=relative>
                        <!-- UP -->
                        <column>
                            <div style='margin-bottom: 0.5rem; width: 8rem; text-align: center;'>
                                Increment recorded value
                            </div>
                            <keyboardKey name=↑ />
                        </column>
                            
                        <row align-v=top>
                            <!-- LEFT -->
                            <row>
                                <div style='margin-left: 1rem; width: 5rem; text-align: right;'>
                                    Jump<br>Back
                                </div>
                                <keyboardKey name=← />
                            </row>
                            
                            <!-- DOWN -->
                            <column>
                                <keyboardKey name=↓ />
                                <row width=0>
                                    <div style='margin-top: 0.5rem; width: 8rem; text-align: center;'>
                                        Decrement recorded value
                                    </div>
                                </row>
                            </column>
                            
                            <!-- RIGHT -->
                            <row>
                                <keyboardKey name=→ />
                                <div style='margin-right: 1rem; width: 5rem; text-align: left;'>
                                    Jump<br>Forward
                                </div>
                            </row>
                        </row>
                    </column>
                    
                    <br>
                    <br>
                    
                    <row align-h=space-between>
                        
                        <!-- Slow down video  -->
                        <column class=shift-mapping align-h=center >
                            decrease speed
                            <row align-h=left>
                                <keyboardKey name=shift />
                                +
                                <keyboardKey name=← />
                            </row>
                        </column>
                        
                        <!-- Speed up  -->
                        <column class=shift-mapping align-h=center >
                            increase speed
                            <row align-h=left>
                                <keyboardKey name=shift />
                                +
                                <keyboardKey name=→ />
                            </row>
                        </column>
                        
                    </row>
                    
                    <br>
                    <br>
                    
                    <!-- spacebar -->
                    <column>
                        Toggle play / pause
                        <keyboardKey name=spacebar >
                            <pre>              </pre>
                        </keyboardKey>
                    </column>
                    
                    <br>
                    <br>
                    
                    <!-- erase -->
                    <row>
                        <keyboardKey name=e />
                        Eraser (hold down)
                    </row>
                    
                </div>
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
        </newspaperLayout>
        
    </column>
</template>

<script>
import NewspaperLayout from "./newspaperLayout"
import Vue from 'vue'

export default {
    components: { 
        NewspaperLayout, 
        // the key component (like arrow key)
        keyboardKey: Vue.extend((h, {children}, {name})=> 
            <div class='key'>
                {[name, ...children]}
            </div>
        )
    },
}
</script>

<style lang="scss" scoped>
    .help-menu {
        width: 100%;
        height: 100%;
        overflow: auto;
        background: var(--gray-dark);
        color: whitesmoke;
        
        pre, code {
            color: var(--cyan);
        }
        
        h4 {
            margin-top: 1.8rem;
            margin-bottom: 0.8rem;
            color: white;
        }
        
        p {
            padding: 0.4rem;
        }
        
        .key {
            width: fit-content;
            border-radius: 0.4rem;
            background: var(--gray-dark);
            box-shadow: rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 3px 1px -2px, rgba(0, 0, 0, 0.2) 0px 1px 5px 0px;
            margin: 0.25rem 0.5rem;
            height: 2.8rem;
            display: flex;
            padding: 0.8rem;
            align-content: center;
            align-items: center;
            justify-items: center;
            justify-content: center;
            text-align: center;
            min-width: 3rem;
            position: relative;
        }
        
        .shift-mapping {
            border: 2px whitesmoke solid;
            border-radius: 0.5rem;
            width: fit-content;
            padding: 0.4rem;
            padding-bottom: 0.2rem;
            padding-top: 0.7rem;
        }
        
        ol  {
            li {
                margin-top: 0.7rem;
                margin-bottom: 0.3rem;
                text-decoration: underline;
                font-size: 13pt;
            }
            
            & div {
                margin-left: 1rem;
            }
        }
        
        .underline {
            text-decoration: underline;
        }
        
        .card {
            margin-top: 1.5rem;
            padding: 1.5rem;
            box-shadow: rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 3px 1px -2px, rgba(0, 0, 0, 0.2) 0px 1px 5px 0px;
            background: var(--gray);
            border-radius: 1rem;
            max-width: 30rem;
            
            h4 {
                margin-top: 0.8rem;
            }
        }
    }
</style>