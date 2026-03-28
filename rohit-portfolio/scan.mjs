import fs from 'fs';
import path from 'path';

const WORKSPACE_DIR = path.resolve('d:\\Project');
const OUTPUT_FILE = path.resolve('d:\\Project\\rohit-portfolio\\public\\data\\projects.json');
const IGNORE_DIRS = ['node_modules', '.git', 'venv', '.venv', 'rohit-portfolio', 'dist', 'build', '.idea', '.vscode'];

// Helper to check if a directory is a project root
function isProjectRoot(dir) {
    const files = fs.readdirSync(dir);
    return files.some(f =>
        f === 'package.json' ||
        f === 'requirements.txt' ||
        f === 'pom.xml' ||
        f === 'build.gradle' ||
        f === 'main.py' ||
        f.endsWith('.ipynb')
    );
}

// Recursively find projects
function findProjects(dir, projects = []) {
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        // If this itself is a project, add it and don't go deeper to avoid sub-projects of projects unless needed
        // Actually, mono-repos might have sub-projects. For simplicity, we scan everything but only consider
        // valid project roots.

        let isRoot = false;
        try {
            isRoot = isProjectRoot(dir);
        } catch (e) { }

        if (isRoot && dir !== WORKSPACE_DIR) {
            projects.push(dir);
            return projects; // Stop scanning deeper in this branch to avoid picking up sub-folders as separate projects
        }

        for (const entry of entries) {
            if (entry.isDirectory() && !IGNORE_DIRS.includes(entry.name)) {
                findProjects(path.join(dir, entry.name), projects);
            }
        }
    } catch (err) {
        // Ignore permission errors etc
    }
    return projects;
}

// Extractor logic
function extractProjectData(projectPath) {
    const folderName = path.basename(projectPath);
    let title = folderName.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    let description = 'A project built by Rohit Ranvir.';
    let tech = [];
    let category = 'Web Dev';
    let githubUrl = '';
    const files = fs.readdirSync(projectPath);

    // Check package.json
    if (files.includes('package.json')) {
        try {
            const pkg = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), 'utf8'));
            if (pkg.name) title = pkg.name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            if (pkg.description) description = pkg.description;
            if (pkg.repository?.url) githubUrl = pkg.repository.url.replace(/^git\+/, '').replace(/\.git$/, '');

            const deps = { ...pkg.dependencies, ...pkg.devDependencies };
            if (deps) {
                if (deps.react) tech.push('React');
                if (deps.express) tech.push('Express');
                if (deps.mongoose) tech.push('MongoDB');
                if (deps.tailwindcss) tech.push('Tailwind CSS');
                if (deps.next) { tech.push('Next.js'); category = 'Web Dev'; }
                if (deps.vue) { tech.push('Vue'); category = 'Web Dev'; }
            }
            tech.push('Node.js');
        } catch (e) { }
    }

    // Check Python
    if (files.includes('requirements.txt') || files.some(f => f.endsWith('.py') || f.endsWith('.ipynb'))) {
        tech.push('Python');
        if (files.some(f => f.endsWith('.ipynb'))) {
            category = 'ML & AI';
            tech.push('Jupyter');
        }
        try {
            if (files.includes('requirements.txt')) {
                const reqs = fs.readFileSync(path.join(projectPath, 'requirements.txt'), 'utf8');
                if (reqs.includes('django')) { tech.push('Django'); category = 'Web Dev'; }
                if (reqs.includes('flask')) { tech.push('Flask'); category = 'Web Dev'; }
                if (reqs.includes('pandas')) { tech.push('Pandas'); category = 'Data'; }
                if (reqs.includes('numpy')) tech.push('NumPy');
                if (reqs.includes('tensorflow') || reqs.includes('keras') || reqs.includes('torch')) {
                    category = 'ML & AI';
                    tech.push('Deep Learning');
                }
                if (reqs.includes('scikit-learn')) {
                    category = 'ML & AI';
                    tech.push('Machine Learning');
                }
            }
        } catch (e) { }
    }

    // Java
    if (files.includes('pom.xml') || files.includes('build.gradle') || files.some(f => f.endsWith('.java'))) {
        tech.push('Java');
        category = 'Tools'; // Or backend web dev if spring is found
        try {
            if (files.includes('pom.xml')) {
                const pom = fs.readFileSync(path.join(projectPath, 'pom.xml'), 'utf8');
                if (pom.includes('spring-boot')) {
                    tech.push('Spring Boot');
                    category = 'Web Dev';
                }
            }
        } catch (e) { }
    }

    // HTML/CSS/JS basic
    if (files.includes('index.html') && !tech.includes('React') && !tech.includes('Node.js')) {
        tech.push('HTML5', 'CSS3', 'JavaScript');
        category = 'Web Dev';
    }

    // Deduplicate tech
    tech = [...new Set(tech)];
    if (tech.length === 0) tech = ['Software Development'];

    // Check README for description
    if (files.some(f => f.toLowerCase() === 'readme.md')) {
        try {
            const readmeName = files.find(f => f.toLowerCase() === 'readme.md');
            const readme = fs.readFileSync(path.join(projectPath, readmeName), 'utf8');
            // Extract first paragraph or first line after # 
            const lines = readme.split('\\n');
            for (const line of lines) {
                if (line.trim().length > 20 && !line.startsWith('#') && !line.startsWith('![')) {
                    description = line.trim().substring(0, 150) + '...';
                    break;
                }
            }
        } catch (e) { }
    }

    // Extract git URL if available and not found in package.json
    if (!githubUrl && fs.existsSync(path.join(projectPath, '.git', 'config'))) {
        try {
            const gitConfig = fs.readFileSync(path.join(projectPath, '.git', 'config'), 'utf8');
            const match = gitConfig.match(/url = (.*)/);
            if (match) githubUrl = match[1].trim();
        } catch (e) { }
    }

    // Find images
    let image = '';
    // Check common image folders or root
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
    const potentialImages = files.filter(f => imageExtensions.some(ext => f.toLowerCase().endsWith(ext)));
    if (potentialImages.length > 0) {
        // Ideally we would copy this to public folder, but for now we'll just reference the relative path or leave empty 
        // since accessing absolute local D: drive paths from the browser is restricted due to security.
        // For a real portfolio, the user needs to manually upload thumbnails.
        image = '';
    }

    return {
        id: folderName.toLowerCase().replace(/\\s+/g, '-') + '-' + Math.random().toString(36).substr(2, 5),
        title,
        description,
        category,
        tech,
        githubUrl,
        liveUrl: '',
        image: '', // Needs manual image addition via admin panel
        featured: false,
        visible: true
    };
}

console.log('Scanning workspace directory:', WORKSPACE_DIR);
const projectPaths = findProjects(WORKSPACE_DIR);
console.log(`Found ${projectPaths.length} potential projects.`);

const projects = projectPaths.map(extractProjectData);

// Load existing projects to avoid overwriting manually added ones if needed, or just overwrite.
// The prompt says "Build a projects.json file with all extracted data", implying fresh build.
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(projects, null, 2));

console.log(`Successfully wrote ${projects.length} projects to ${OUTPUT_FILE}`);
