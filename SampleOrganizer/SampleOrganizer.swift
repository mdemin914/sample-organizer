import Foundation
import SwiftUI

@MainActor
class SampleOrganizer: ObservableObject {
    @Published var inputDirectory: URL?
    @Published var outputDirectory: URL?
    @Published var outputStructure: [String: [String]] = [:]
    @Published var organizedFiles: [String] = []
    @Published var unmatchedFiles: [String] = []
    @Published var isProcessing = false
    @Published var progress: Double = 0.0
    @Published var statusMessage = ""
    
    private let fileMatcher = FileMatcher()
    
    var hasResults: Bool {
        !organizedFiles.isEmpty || !unmatchedFiles.isEmpty
    }
    
    func scanOutputDirectory() {
        guard let outputDir = outputDirectory else { return }
        
        isProcessing = true
        statusMessage = "Scanning output directory structure..."
        progress = 0.0
        
        Task {
            do {
                let structure = try await scanDirectoryStructure(at: outputDir)
                await MainActor.run {
                    self.outputStructure = structure
                    self.isProcessing = false
                    self.statusMessage = "Found \(structure.count) top-level categories"
                    self.progress = 1.0
                }
            } catch {
                await MainActor.run {
                    self.isProcessing = false
                    self.statusMessage = "Error scanning directory: \(error.localizedDescription)"
                    self.progress = 0.0
                }
            }
        }
    }
    
    func organizeSamples() {
        guard let inputDir = inputDirectory,
              let outputDir = outputDirectory else { return }
        
        isProcessing = true
        statusMessage = "Starting sample organization..."
        progress = 0.0
        organizedFiles.removeAll()
        unmatchedFiles.removeAll()
        
        Task {
            do {
                let (organized, unmatched) = try await organizeSamples(
                    from: inputDir,
                    to: outputDir
                )
                
                await MainActor.run {
                    self.organizedFiles = organized
                    self.unmatchedFiles = unmatched
                    self.isProcessing = false
                    self.statusMessage = "Completed! Organized \(organized.count) files, \(unmatched.count) unmatched"
                    self.progress = 1.0
                }
            } catch {
                await MainActor.run {
                    self.isProcessing = false
                    self.statusMessage = "Error organizing samples: \(error.localizedDescription)"
                    self.progress = 0.0
                }
            }
        }
    }
    
    private func scanDirectoryStructure(at url: URL) async throws -> [String: [String]] {
        let fileManager = FileManager.default
        let contents = try fileManager.contentsOfDirectory(
            at: url,
            includingPropertiesForKeys: [.isDirectoryKey],
            options: [.skipsHiddenFiles]
        )
        
        var structure: [String: [String]] = [:]
        
        for item in contents {
            let isDirectory = try item.resourceValues(forKeys: [.isDirectoryKey]).isDirectory ?? false
            if isDirectory {
                let categoryName = item.lastPathComponent
                let subItems = try await scanSubdirectories(at: item)
                structure[categoryName] = subItems
            }
        }
        
        return structure
    }
    
    private func scanSubdirectories(at url: URL) async throws -> [String] {
        let fileManager = FileManager.default
        let contents = try fileManager.contentsOfDirectory(
            at: url,
            includingPropertiesForKeys: [.isDirectoryKey],
            options: [.skipsHiddenFiles]
        )
        
        var subdirectories: [String] = []
        
        for item in contents {
            let isDirectory = try item.resourceValues(forKeys: [.isDirectoryKey]).isDirectory ?? false
            if isDirectory {
                subdirectories.append(item.lastPathComponent)
            }
        }
        
        return subdirectories
    }
    
    private func organizeSamples(from inputDir: URL, to outputDir: URL) async throws -> ([String], [String]) {
        let fileManager = FileManager.default
        let contents = try fileManager.contentsOfDirectory(
            at: inputDir,
            includingPropertiesForKeys: [.isRegularFileKey],
            options: [.skipsHiddenFiles]
        )
        
        let audioFiles = contents.filter { url in
            let pathExtension = url.pathExtension.lowercased()
            return ["wav", "aif", "aiff", "mp3", "flac", "m4a", "ogg"].contains(pathExtension)
        }
        
        var organized: [String] = []
        var unmatched: [String] = []
        
        let totalFiles = audioFiles.count
        
        for (index, file) in audioFiles.enumerated() {
            await MainActor.run {
                self.progress = Double(index) / Double(totalFiles)
                self.statusMessage = "Processing \(file.lastPathComponent)..."
            }
            
            if let destination = fileMatcher.findBestMatch(
                for: file.lastPathComponent,
                in: outputStructure
            ) {
                let destinationURL = outputDir.appendingPathComponent(destination)
                
                do {
                    try fileManager.createDirectory(
                        at: destinationURL.deletingLastPathComponent(),
                        withIntermediateDirectories: true
                    )
                    
                    let finalURL = destinationURL.appendingPathComponent(file.lastPathComponent)
                    
                    if fileManager.fileExists(atPath: finalURL.path) {
                        // Handle duplicate files
                        let newName = generateUniqueFileName(for: file.lastPathComponent, at: destinationURL)
                        let finalURL = destinationURL.appendingPathComponent(newName)
                        try fileManager.copyItem(at: file, to: finalURL)
                    } else {
                        try fileManager.copyItem(at: file, to: finalURL)
                    }
                    
                    organized.append(file.lastPathComponent)
                } catch {
                    print("Error copying file \(file.lastPathComponent): \(error)")
                    unmatched.append(file.lastPathComponent)
                }
            } else {
                unmatched.append(file.lastPathComponent)
            }
        }
        
        return (organized, unmatched)
    }
    
    private func generateUniqueFileName(for originalName: String, at directory: URL) -> String {
        let fileManager = FileManager.default
        let nameWithoutExtension = (originalName as NSString).deletingPathExtension
        let pathExtension = (originalName as NSString).pathExtension
        
        var counter = 1
        var newName = originalName
        
        while fileManager.fileExists(atPath: directory.appendingPathComponent(newName).path) {
            newName = "\(nameWithoutExtension) (\(counter)).\(pathExtension)"
            counter += 1
        }
        
        return newName
    }
}