import Foundation

class FileMatcher {
    // Common musical sample categories and their associated keywords
    private let categoryKeywords: [String: [String]] = [
        "drums": ["drum", "kick", "snare", "tom", "hihat", "hi-hat", "hat", "crash", "ride", "cymbal", "percussion", "beat", "loop"],
        "bass": ["bass", "sub", "low", "808", "909", "kick", "bassline"],
        "synth": ["synth", "lead", "pad", "arp", "arp", "pluck", "bell", "chord", "melody"],
        "fx": ["fx", "effect", "sweep", "riser", "downer", "transition", "atmosphere", "ambient"],
        "vocal": ["vocal", "voice", "choir", "chant", "scream", "whisper", "talk"],
        "guitar": ["guitar", "acoustic", "electric", "distortion", "clean", "riff"],
        "piano": ["piano", "keys", "keyboard", "rhodes", "wurlitzer", "organ"],
        "strings": ["string", "violin", "cello", "viola", "orchestra", "ensemble"],
        "brass": ["brass", "trumpet", "trombone", "horn", "saxophone", "sax"],
        "woodwind": ["woodwind", "flute", "clarinet", "oboe", "bassoon"],
        "ethnic": ["ethnic", "world", "african", "indian", "middle eastern", "latin", "celtic"],
        "foley": ["foley", "sound effect", "impact", "whoosh", "swoosh", "swish"]
    ]
    
    // Subcategory mappings for more specific organization
    private let subcategoryKeywords: [String: [String: [String]]] = [
        "drums": [
            "cymbals": ["cymbal", "crash", "ride", "splash", "china", "bell"],
            "hats": ["hat", "hihat", "hi-hat", "open hat", "closed hat", "pedal hat"],
            "kicks": ["kick", "bass drum", "bd", "kick drum"],
            "snares": ["snare", "snare drum", "sd", "rim", "clap"],
            "toms": ["tom", "tom drum", "floor tom", "rack tom", "low tom", "high tom"],
            "percussion": ["percussion", "shaker", "tambourine", "conga", "bongo", "djembe", "cowbell"]
        ],
        "synth": [
            "leads": ["lead", "melody", "hook", "solo"],
            "pads": ["pad", "atmosphere", "ambient", "texture", "wash"],
            "plucks": ["pluck", "plucky", "staccato", "short"],
            "bells": ["bell", "chime", "glockenspiel", "xylophone", "marimba"]
        ]
    ]
    
    func findBestMatch(for fileName: String, in outputStructure: [String: [String]]) -> String? {
        let fileNameLower = fileName.lowercased()
        let nameWithoutExtension = (fileName as NSString).deletingPathExtension.lowercased()
        
        // First, try to find a direct match in the output structure
        if let directMatch = findDirectMatch(fileName: fileNameLower, structure: outputStructure) {
            return directMatch
        }
        
        // Then try keyword-based matching
        if let keywordMatch = findKeywordMatch(fileName: nameWithoutExtension, structure: outputStructure) {
            return keywordMatch
        }
        
        // Finally, try fuzzy matching
        return findFuzzyMatch(fileName: nameWithoutExtension, structure: outputStructure)
    }
    
    private func findDirectMatch(fileName: String, structure: [String: [String]]) -> String? {
        // Check if the filename contains any of the category names directly
        for (category, subcategories) in structure {
            let categoryLower = category.lowercased()
            
            // Check main category
            if fileName.contains(categoryLower) {
                return category
            }
            
            // Check subcategories
            for subcategory in subcategories {
                let subcategoryLower = subcategory.lowercased()
                if fileName.contains(subcategoryLower) {
                    return "\(category)/\(subcategory)"
                }
            }
        }
        
        return nil
    }
    
    private func findKeywordMatch(fileName: String, structure: [String: [String]]) -> String? {
        var bestMatch: (category: String, subcategory: String?, score: Double)?
        
        for (category, subcategories) in structure {
            let categoryScore = calculateKeywordScore(fileName: fileName, keywords: categoryKeywords[category] ?? [])
            
            if let subcategory = findBestSubcategory(fileName: fileName, subcategories: subcategories, category: category) {
                let totalScore = categoryScore + subcategory.score
                if bestMatch == nil || totalScore > bestMatch!.score {
                    bestMatch = (category: category, subcategory: subcategory.name, score: totalScore)
                }
            } else if categoryScore > 0.3 { // Threshold for main category only
                if bestMatch == nil || categoryScore > bestMatch!.score {
                    bestMatch = (category: category, subcategory: nil, score: categoryScore)
                }
            }
        }
        
        if let match = bestMatch {
            if let subcategory = match.subcategory {
                return "\(match.category)/\(subcategory)"
            } else {
                return match.category
            }
        }
        
        return nil
    }
    
    private func findBestSubcategory(fileName: String, subcategories: [String], category: String) -> (name: String, score: Double)? {
        var bestSubcategory: (name: String, score: Double)?
        
        for subcategory in subcategories {
            let keywords = subcategoryKeywords[category]?[subcategory] ?? [subcategory]
            let score = calculateKeywordScore(fileName: fileName, keywords: keywords)
            
            if score > 0.2 && (bestSubcategory == nil || score > bestSubcategory!.score) {
                bestSubcategory = (name: subcategory, score: score)
            }
        }
        
        return bestSubcategory
    }
    
    private func calculateKeywordScore(fileName: String, keywords: [String]) -> Double {
        var totalScore = 0.0
        let wordCount = fileName.components(separatedBy: CharacterSet.alphanumerics.inverted).filter { !$0.isEmpty }.count
        
        for keyword in keywords {
            let keywordLower = keyword.lowercased()
            
            // Exact match gets highest score
            if fileName.contains(keywordLower) {
                totalScore += 1.0
            }
            
            // Partial word matches get lower scores
            let words = fileName.components(separatedBy: CharacterSet.alphanumerics.inverted).filter { !$0.isEmpty }
            for word in words {
                if word.lowercased().contains(keywordLower) || keywordLower.contains(word.lowercased()) {
                    totalScore += 0.5
                }
            }
        }
        
        // Normalize by word count to avoid bias towards longer filenames
        return wordCount > 0 ? totalScore / Double(wordCount) : totalScore
    }
    
    private func findFuzzyMatch(fileName: String, structure: [String: [String]]) -> String? {
        // Simple fuzzy matching based on character similarity
        var bestMatch: (category: String, score: Double)?
        
        for (category, subcategories) in structure {
            let categoryScore = calculateFuzzyScore(fileName: fileName, target: category)
            
            if categoryScore > 0.6 { // Threshold for fuzzy matching
                if bestMatch == nil || categoryScore > bestMatch!.score {
                    bestMatch = (category: category, score: categoryScore)
                }
            }
            
            // Also check subcategories
            for subcategory in subcategories {
                let subcategoryScore = calculateFuzzyScore(fileName: fileName, target: subcategory)
                if subcategoryScore > 0.6 {
                    let totalScore = (categoryScore + subcategoryScore) / 2.0
                    if bestMatch == nil || totalScore > bestMatch!.score {
                        bestMatch = (category: "\(category)/\(subcategory)", score: totalScore)
                    }
                }
            }
        }
        
        return bestMatch?.category
    }
    
    private func calculateFuzzyScore(fileName: String, target: String) -> Double {
        let fileNameLower = fileName.lowercased()
        let targetLower = target.lowercased()
        
        // Simple Levenshtein-like distance calculation
        let distance = levenshteinDistance(fileNameLower, targetLower)
        let maxLength = max(fileNameLower.count, targetLower.count)
        
        return maxLength > 0 ? 1.0 - (Double(distance) / Double(maxLength)) : 0.0
    }
    
    private func levenshteinDistance(_ s1: String, _ s2: String) -> Int {
        let empty = Array(repeating: 0, count: s2.count + 1)
        var last = Array(0...s2.count)
        
        for (i, char1) in s1.enumerated() {
            var current = [i + 1] + empty
            for (j, char2) in s2.enumerated() {
                current[j + 1] = char1 == char2 ? last[j] : min(last[j], last[j + 1], current[j]) + 1
            }
            last = current
        }
        return last[s2.count]
    }
}