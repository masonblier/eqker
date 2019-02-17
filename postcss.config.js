module.exports = {
    plugins: [
        require('tailwindcss')('./tailwind.config.js'),
        require('postcss-css-variables'),
        require('postcss-nested'),
        require('autoprefixer'),
        require('cssnano'),
    ]
}
