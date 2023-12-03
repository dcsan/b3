from flask import Flask, render_template, request
import subprocess
import os

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/run_script_main', methods=['POST'])
def run_script_main():
    result = subprocess.run(['python', 'main.py'], stdout=subprocess.PIPE)
    output = result.stdout.decode('utf-8')
    return render_template('output_template.html', output=output)

@app.route('/run_script_who', methods=['POST'])
def run_script_who():
    result = subprocess.run(['python', 'main_who.py'], stdout=subprocess.PIPE)
    output = result.stdout.decode('utf-8')
    return render_template('output_template.html', output=output)

@app.route('/run_script_missing', methods=['POST'])
def run_script_missing():
    result = subprocess.run(['python', 'main_missing.py'], stdout=subprocess.PIPE)
    output = result.stdout.decode('utf-8')
    return render_template('output_template.html', output=output)

if __name__ == '__main__':
    app.run(debug=True)
