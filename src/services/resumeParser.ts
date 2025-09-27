// Mock resume parsing service - in production, this would use actual PDF/DOCX parsing libraries
export interface ParsedResumeData {
  name?: string;
  email?: string;
  phone?: string;
  text: string;
}

export class ResumeParser {
  async parseFile(file: File): Promise<ParsedResumeData> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string || '';
        
        // Mock parsing logic - in production, use pdf-parse or mammoth libraries
        const parsedData = this.extractFields(text, file.name);
        resolve(parsedData);
      };
      
      // For demonstration, we'll just read as text
      // In production, handle PDF/DOCX properly
      reader.readAsText(file);
    });
  }

  private extractFields(text: string, filename: string): ParsedResumeData {
    // Mock extraction logic
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const nameRegex = /^([A-Z][a-z]+ [A-Z][a-z]+)/m;

    const email = text.match(emailRegex)?.[0];
    const phone = text.match(phoneRegex)?.[0];
    const name = text.match(nameRegex)?.[0] || this.extractNameFromFilename(filename);

    // For demo purposes, provide some mock data if fields are missing
    const mockData = {
      name: name || 'John Doe',
      email: email || 'john.doe@example.com',
      phone: phone || '+1-555-123-4567',
      text: text || `Sample resume content for ${name || 'John Doe'}. 
      
      Skills: React, Node.js, JavaScript, TypeScript, MongoDB, Express.js
      
      Experience:
      - Full Stack Developer at Tech Corp (2022-Present)
      - Frontend Developer at StartupXYZ (2020-2022)
      
      Education:
      - Bachelor of Science in Computer Science`
    };

    return mockData;
  }

  private extractNameFromFilename(filename: string): string {
    return filename
      .replace(/\.(pdf|docx|doc)$/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
}

export const resumeParser = new ResumeParser();