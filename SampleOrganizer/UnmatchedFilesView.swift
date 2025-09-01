import SwiftUI

struct UnmatchedFilesView: View {
    let unmatchedFiles: [String]
    let outputStructure: [String: [String]]
    
    @State private var fileAssignments: [String: String] = [:]
    @State private var showingSaveAlert = false
    @State private var saveError: String?
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Header
                VStack(spacing: 8) {
                    Text("Unmatched Files")
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    Text("\(unmatchedFiles.count) files need manual categorization")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding()
                
                // File List
                List {
                    ForEach(unmatchedFiles, id: \.self) { fileName in
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(fileName)
                                    .font(.headline)
                                    .lineLimit(1)
                                
                                Text("Select destination folder")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            
                            Spacer()
                            
                            Menu {
                                ForEach(Array(outputStructure.keys.sorted()), id: \.self) { category in
                                    Menu(category) {
                                        if let subcategories = outputStructure[category] {
                                            ForEach(subcategories.sorted(), id: \.self) { subcategory in
                                                Button("\(category)/\(subcategory)") {
                                                    fileAssignments[fileName] = "\(category)/\(subcategory)"
                                                }
                                            }
                                        }
                                        
                                        Button(category) {
                                            fileAssignments[fileName] = category
                                        }
                                    }
                                }
                                
                                Divider()
                                
                                Button("Skip this file") {
                                    fileAssignments[fileName] = "SKIP"
                                }
                                .foregroundColor(.orange)
                            } label: {
                                HStack {
                                    Text(fileAssignments[fileName] ?? "Select...")
                                        .foregroundColor(fileAssignments[fileName] == nil ? .secondary : .primary)
                                    
                                    Image(systemName: "chevron.down")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Color(.controlBackgroundColor))
                                .cornerRadius(6)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }
                
                // Action Buttons
                HStack(spacing: 16) {
                    Button("Cancel") {
                        // Dismiss the view
                    }
                    .buttonStyle(.bordered)
                    
                    Spacer()
                    
                    Button("Apply Assignments") {
                        applyAssignments()
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(fileAssignments.count != unmatchedFiles.count)
                }
                .padding()
            }
            .frame(minWidth: 600, minHeight: 400)
            .alert("Save Error", isPresented: .constant(saveError != nil)) {
                Button("OK") {
                    saveError = nil
                }
            } message: {
                if let error = saveError {
                    Text(error)
                }
            }
        }
    }
    
    private func applyAssignments() {
        // Here you would implement the logic to move files based on assignments
        // For now, we'll just show a success message
        showingSaveAlert = true
        
        // In a real implementation, you would:
        // 1. Iterate through fileAssignments
        // 2. Move each file to its assigned destination
        // 3. Handle any errors that occur during the process
        // 4. Update the main organizer with the results
    }
}

#Preview {
    UnmatchedFilesView(
        unmatchedFiles: ["kick_01.wav", "snare_heavy.aif", "synth_lead.mp3"],
        outputStructure: [
            "drums": ["kicks", "snares", "cymbals"],
            "synth": ["leads", "pads", "plucks"]
        ]
    )
}