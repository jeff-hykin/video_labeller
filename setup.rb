require 'atk_toolbox'

if OS.is?("mac")
    system "brew install node"
    system "npm install"
elsif OS.is?("windows")
    system "scoop install nodejs"
    system "npm install"
elsif OS.is?("ubuntu")
    system "sudo apt install nodejs"
    system "npm install"
end