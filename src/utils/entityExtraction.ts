
interface Entity {
  text: string;
  type: string;
  sentiment?: number;
  frequency: number;
}

/**
 * Extracts entities from the document text
 * @param text The document text to analyze
 * @returns Array of entities found in the text
 */
export const extractEntities = async (text: string): Promise<Entity[]> => {
  try {
    console.log("Extracting entities from text:", text.substring(0, 100) + "...");
    
    // This is a simple placeholder implementation
    // In a real application, we would use NLP libraries or APIs
    
    // Create some basic entity detection logic
    const people = ["John", "Mary", "David", "Sarah", "Michael", "Lisa"];
    const places = ["London", "Paris", "New York", "Tokyo", "Berlin", "Rome"];
    const organizations = ["Google", "Microsoft", "Apple", "Amazon", "Facebook"];
    
    const entities: Entity[] = [];
    const words = text.split(/\s+/);
    
    // Count word frequencies
    const wordFreq: Record<string, number> = {};
    words.forEach(word => {
      const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
      if (cleanWord && cleanWord.length > 1) {
        wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
      }
    });
    
    // Check for people
    people.forEach(person => {
      if (text.toLowerCase().includes(person.toLowerCase())) {
        entities.push({
          text: person,
          type: "Person",
          sentiment: Math.random() * 0.5 + 0.25, // Random sentiment between 0.25 and 0.75
          frequency: wordFreq[person] || 1
        });
      }
    });
    
    // Check for places
    places.forEach(place => {
      if (text.toLowerCase().includes(place.toLowerCase())) {
        entities.push({
          text: place,
          type: "Place",
          sentiment: Math.random() * 0.5 + 0.25,
          frequency: wordFreq[place] || 1
        });
      }
    });
    
    // Check for organizations
    organizations.forEach(org => {
      if (text.toLowerCase().includes(org.toLowerCase())) {
        entities.push({
          text: org,
          type: "Organization",
          sentiment: Math.random() * 0.5 + 0.25,
          frequency: wordFreq[org] || 1
        });
      }
    });
    
    // If we didn't find any real entities, add a few placeholder ones
    if (entities.length === 0) {
      entities.push(
        { text: "Time", type: "Concept", sentiment: 0.65, frequency: 3 },
        { text: "Experience", type: "Concept", sentiment: 0.45, frequency: 5 },
        { text: "Feeling", type: "Concept", sentiment: 0.35, frequency: 7 }
      );
    }
    
    return entities;
  } catch (error) {
    console.error("Error extracting entities:", error);
    return [
      { text: "Error", type: "System", frequency: 1 }
    ];
  }
};
