export default class LabelRecord {
    constructor({records, numberOfChunks, graphFrameRate}) {
        this.graphFrameRate = graphFrameRate
        this.records = records || []
        // init the chunks version
        this.chunks = []
        for (let i = 0; i < numberOfChunks; i++) {
            this.chunks.push([])
        }
    }
    toJSON() {
        return this.records
    }
    getChunkIndexFor(record) {
        let [ time, value ] = record
        return Math.floor( time * this.graphFrameRate )
    }
    addRecordToChunks(record) {
        this.chunks[this.getChunkIndexFor(record)].push(record)
    }
    addNewRecordSegment(newRecords) {
        if (newRecords.length != 0) {
            // extract start and end times
            let oldestRecord = newRecords[0]
            let newestRecord = newRecords[newRecords.length-1]
            let startTime    = oldestRecord[0]
            let endTime      = newestRecord[0]
            // 
            // remove all of the records times that are in this record's duration
            // replace them with the new records
            // 
            let startIndex = null
            let endIndex = null
            for (let eachIndex in this.records) {
                // convert to number
                eachIndex = eachIndex-0
                
                let [eachTime, eachValue] = this.records[eachIndex]
                if (startIndex == null && eachTime >= startTime) {
                    startIndex = eachIndex
                }
                if (endIndex == null && eachTime >= endTime) {
                    if (eachTime == endTime) {
                        endIndex = (eachIndex-0)+1
                    } else {
                        endIndex = eachIndex
                    }
                }
            }
            if (startIndex == null) {
                startIndex = this.records.length
            }
            if (endIndex == null) {
                endIndex = this.records.length
            }
            let firstPart = this.records.slice(0, startIndex)
            let middlePart = this.records.slice(startIndex, endIndex)
            let lastPart = this.records.slice(endIndex, this.records.length)
            
            // create a new record with the new info overwriting the old
            this.records = firstPart.concat(newRecords, lastPart)
            
            // remove the middle part from the chunks
            for (let eachRecord of middlePart) {
                // remove the record from its chunk
                this.chunks[this.getChunkIndexFor(eachRecord)].filter(each=>each==eachRecord)
            }
            // add the new middle part to the chunks
            for (let eachRecord of newRecords) {
                this.addRecordToChunks(eachRecord)
            }
        }
    }
    getSegment(startTime, endTime) {
        let startChunkIndex   = this.getChunkIndexFor([startTime, null])
        let endChunkIndex     = this.getChunkIndexFor([endTime, null])
        let startChunk        = this.chunks[startChunkIndex]
        let endChunk          = this.chunks[endChunkIndex]
        let startingRecords   = startChunk.filter(each=>each[0]>=startTime)
        let endingRecords     = endChunk.filter(each=>each[0]<=endTime)
        let chunkInnerSegment = this.chunks.filter((each, index)=>index>startChunkIndex && index<endChunkIndex)
        return startingRecords.concat(...endingRecords, endChunk)
    }
}