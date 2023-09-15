import gulp from "gulp"
import plumber from "gulp-plumber"
import sass from "gulp-dart-sass"
import postcss from "gulp-postcss"
import csso from "postcss-csso"
import rename from "gulp-rename"
import autoprefixer from "autoprefixer"
import browser from "browser-sync"
import htmlmin from "gulp-htmlmin"
import terser from "gulp-terser"
import squoosh from "gulp-libsquoosh"
import svgo from "gulp-svgmin"
import svgstore from "gulp-svgstore"
import clean from "gulp-clean"

// Styles

export const styles = () => {
    return gulp
        .src("source/sass/style.scss", { sourcemaps: true })
        .pipe(plumber())
        .pipe(sass().on("error", sass.logError))
        .pipe(postcss([autoprefixer(), csso()]))
        .pipe(rename("style.min.css"))
        .pipe(gulp.dest("build/css", { sourcemaps: "." }))
        .pipe(browser.stream())
}

//HTML

const html = () => {
    return gulp
        .src("source/*.html")
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest("build"))
}

//JS

const scripts = () => {
    return gulp.src("source/js/*.js").pipe(terser()).pipe(gulp.dest("build/js"))
}

//Images

const optimizeImages = () => {
    return gulp
        .src("source/img/**/*.{jpg,png,svg}")
        .pipe(squoosh())
        .pipe(gulp.dest("build/img"))
}

const copyImages = () => {
    return gulp
        .src("source/img/**/*.{jpg,png,svg}")
        .pipe(gulp.dest("build/img"))
}

//Webp

const createWebp = () => {
    return gulp
        .src("source/img/*.{jpg,png,svg}")
        .pipe(
            squoosh({
                webp: {},
            })
        )
        .pipe(gulp.dest("build/img"))
}

//SVG

export const svg = () => {
    return gulp
        .src(["source/img/*.svg", "!source/img/icons/*.svg"])
        .pipe(svgo())
        .pipe(gulp.dest("build/img"))
}

const sprite = () => {
    return gulp
        .src("source/img/icons/*.svg")
        .pipe(svgo())
        .pipe(
            svgstore({
                inlineSvg: true,
            })
        )
        .pipe(rename("sprite.svg"))
        .pipe(gulp.dest("build/img"))
}

//fonts

const copy = (done) => {
    gulp.src(["source/fonts/**/*.{woff2,woff}", "source/*.ico"], {
        base: "source",
    }).pipe(gulp.dest("build"))
    done()
}

//clean

const cleanfile = (done) => {
    return gulp
        .src("build", { read: false, allowEmpty: true })
        .pipe(clean())
        .on("end", done) // Завершение задачи clean
}

// Server

function server(done) {
    browser.init({
        server: {
            baseDir: "build",
        },
        cors: true,
        notify: false,
        ui: false,
    })
    done()
}

// Reload

const reload = (done) => {
    browser.reload()
    done()
}

// Watcher

const watcher = () => {
    gulp.watch("source/sass/**/*.scss", gulp.series(styles))
    gulp.watch("source/js/script.js", gulp.series(scripts))
    gulp.watch("source/*.html", gulp.series(html, reload))
}

// Build

export const build = gulp.series(
    cleanfile,
    copy,
    optimizeImages,
    gulp.parallel(styles, html, scripts, svg, sprite, createWebp)
)

// Default

export const start = gulp.series(
    cleanfile,
    copy,
    copyImages,
    gulp.parallel(styles, html, scripts, svg, sprite, createWebp),
    gulp.series(server, watcher)
)
