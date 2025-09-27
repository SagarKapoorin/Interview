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

    // Return raw extracted fields; missing values will be prompted later
    return {
      name: name || undefined,
      email: email || undefined,
      phone: phone || undefined,
      text: text
    };
  }

  private extractNameFromFilename(filename: string): string {
    return filename
      .replace(/\.(pdf|docx|doc)$/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
}

export const resumeParser = new ResumeParser();