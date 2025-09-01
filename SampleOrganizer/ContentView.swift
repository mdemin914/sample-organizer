import SwiftUI
import UniformTypeIdentifiers

struct ContentView: View {
    @StateObject private var organizer = SampleOrganizer()
    @State private var showingInputPicker = false
    @State private var showingOutputPicker = false
    @State private var showingUnmatchedFiles = false
    
    var body: some View {
        VStack(spacing: 20) {
            // Header
            VStack(spacing: 8) {
                Text("Sample Organizer")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                Text("Organize your musical samples automatically")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            .padding(.top, 20)
            
            // Directory Selection
            VStack(spacing: 16) {
                // Output Directory
                VStack(alignment: .leading, spacing: 8) {
                    Text("Output Directory")
                        .font(.headline)
                    
                    HStack {
                        Text(organizer.outputDirectory?.path ?? "No directory selected")
                            .lineLimit(1)
                            .truncationMode(.middle)
                            .padding(8)
                            .background(Color(.controlBackgroundColor))
                            .cornerRadius(6)
                        
                        Button("Browse") {
                            showingOutputPicker = true
                        }
                        .buttonStyle(.borderedProminent)
                    }
                }
                
                // Input Directory
                VStack(alignment: .leading, spacing: 8) {
                    Text("Input Directory")
                        .font(.headline)
                    
                    HStack {
                        Text(organizer.inputDirectory?.path ?? "No directory selected")
                            .lineLimit(1)
                            .truncationMode(.middle)
                            .padding(8)
                            .background(Color(.controlBackgroundColor))
                            .cornerRadius(6)
                        
                        Button("Browse") {
                            showingInputPicker = true
                        }
                        .buttonStyle(.borderedProminent)
                    }
                }
            }
            .padding(.horizontal, 20)
            
            // Action Buttons
            VStack(spacing: 12) {
                Button("Scan Output Directory") {
                    organizer.scanOutputDirectory()
                }
                .buttonStyle(.bordered)
                .disabled(organizer.outputDirectory == nil)
                
                Button("Organize Samples") {
                    organizer.organizeSamples()
                }
                .buttonStyle(.borderedProminent)
                .disabled(organizer.inputDirectory == nil || organizer.outputDirectory == nil)
            }
            
            // Status and Progress
            VStack(spacing: 12) {
                if organizer.isProcessing {
                    ProgressView(value: organizer.progress) {
                        Text("Processing... \(Int(organizer.progress * 100))%")
                    }
                    .progressViewStyle(.linear)
                    .frame(width: 300)
                }
                
                if !organizer.statusMessage.isEmpty {
                    Text(organizer.statusMessage)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
            }
            
            // Results Summary
            if organizer.hasResults {
                VStack(spacing: 8) {
                    Text("Results")
                        .font(.headline)
                    
                    HStack(spacing: 20) {
                        VStack {
                            Text("\(organizer.organizedFiles.count)")
                                .font(.title2)
                                .fontWeight(.bold)
                            Text("Organized")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        VStack {
                            Text("\(organizer.unmatchedFiles.count)")
                                .font(.title2)
                                .fontWeight(.bold)
                            Text("Unmatched")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    if !organizer.unmatchedFiles.isEmpty {
                        Button("Review Unmatched Files") {
                            showingUnmatchedFiles = true
                        }
                        .buttonStyle(.bordered)
                    }
                }
                .padding()
                .background(Color(.controlBackgroundColor))
                .cornerRadius(10)
            }
            
            Spacer()
        }
        .padding()
        .frame(minWidth: 600, minHeight: 500)
        .fileImporter(
            isPresented: $showingInputPicker,
            allowedContentTypes: [.folder],
            allowsMultipleSelection: false
        ) { result in
            switch result {
            case .success(let urls):
                if let url = urls.first {
                    organizer.inputDirectory = url
                }
            case .failure(let error):
                print("Error selecting input directory: \(error)")
            }
        }
        .fileImporter(
            isPresented: $showingOutputPicker,
            allowedContentTypes: [.folder],
            allowsMultipleSelection: false
        ) { result in
            switch result {
            case .success(let urls):
                if let url = urls.first {
                    organizer.outputDirectory = url
                }
            case .failure(let error):
                print("Error selecting output directory: \(error)")
            }
        }
        .sheet(isPresented: $showingUnmatchedFiles) {
            UnmatchedFilesView(
                unmatchedFiles: organizer.unmatchedFiles,
                outputStructure: organizer.outputStructure
            )
        }
    }
}

#Preview {
    ContentView()
}