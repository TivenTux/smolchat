from flask import Flask, render_template, send_from_directory
from flask_socketio import SocketIO
from datetime import datetime
import sqlite3
import pytz
import os
from os import environ
import random
import string
from constants.secrets import *


#conf
#flask secret key, use ENV var or place constant_flask_secret_key = 'SomeRandomString' in constants/secrets.py
if environ.get('flask_secret_key') is not None:
    flask_secret_key = os.environ['flask_secret_key']
else:
    flask_secret_key = constant_flask_secret_key

#port
if environ.get('app_port') is not None:
    app_port = os.environ['app_port']
else:
    app_port = '5714'

#every how many messages should it check for cleanup
total_msg_before_cleanup = 25
#total msgs to always keep in db after cleanup
total_history_keep = 200
#messages that will appear on new client connection (loading from history)
client_max_history_load = 25
#conf end

#init
cleanup_counter = 0
message_db_location = './data/messages.db'
app = Flask(__name__)
app.config['SECRET_KEY'] = flask_secret_key
socketio = SocketIO(app)

def check_if_db_exists(databasefile):
    '''Checks if db already exists'''
    if not os.path.exists(databasefile):
        return 404
    else:
        return 1
    
def create_database(databasefile):
    '''
    Takes db file location, creates db and table data
    '''
    try:
        conn = sqlite3.connect(databasefile)
        print(f"Database '{databasefile}' created successfully.")
        cur = conn.cursor()
        #will use internal row id
        cur.execute('''
            CREATE TABLE IF NOT EXISTS messagedata (                    
                userid TEXT,
                username TEXT,
                date TEXT,
                time TEXT,
                textmessage TEXT,
                profilepicurl TEXT,
                msgid TEXT     
            )
        ''')
        conn.commit()
    except sqlite3.Error as e:
        print(f"Error creating database: {e}")
    finally:
        if conn:
            conn.close()
    return 1

def enable_db_wal(databasefile):
    '''
    Takes db file, enables WAL
    '''
    try:
        conn = sqlite3.connect(databasefile, isolation_level=None)
        conn.execute('pragma journal_mode=wal')
        print('succesfully enabled WAL on db')
    except sqlite3.Error as e:
        print(f"Error enabling WAL database: {e}")
    finally:
        if conn:
            conn.close()
    return 1

if check_if_db_exists(message_db_location) == 404:
    print('db not found, creating new database file')
    create_database(message_db_location)
    enable_db_wal(message_db_location)
else:
    print('db file found')


@app.route('/')
def sessions():
    '''
    Serve main session page
    '''
    return render_template('session.html')

def message_received(methods=['GET', 'POST']):
    '''
    callback function when receiving a message
    '''
    print('message received')
    return

#serve favicon and some other static files
@app.route('/favicon.ico')
def serve_favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')
@app.route('/site.webmanifest')
def serve_site_manifest():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'site.webmanifest', mimetype='application/manifest+json')

#most incoming events
@socketio.on('session_event')
def receive_event(payload, methods=['GET', 'POST']):
    '''
    Handles incoming events
    '''
    cdatetime = datetime.now()
    msg_date = cdatetime.date()
    msg_time = cdatetime.time()
    utc_time = cdatetime.astimezone(pytz.UTC)
    utc_time_only = utc_time.time()
    try:    
        if payload['message'] == '15002_load_session':
            print('new session found, loading history')
            try:
                history = load_messages(message_db_location, 'messagedata', client_max_history_load)
                socketio.emit('session_response', history)
            except Exception as e:
                print(e, ' error 5125')
            return
        
        if payload['message'] and payload['saveduserid']:
            try:
                dbpayload = [payload['saveduserid'], payload['user_name'], str(msg_date), str(utc_time_only), payload['message'], payload['profilepicurl']]
                save_to_database = new_message(message_db_location, "messagedata", dbpayload)
            except Exception as e:
                print(e, ' error 115')

    #catch new sessions and push message history
    except Exception as e:
        print('new session, load history')
        load_old_messages = load_messages(message_db_location, 'messagedata', client_max_history_load)
        load_history = initial_message_load(load_old_messages)

    print('received new event: ' + str(payload) + '   at ', msg_date, ' local: ', msg_time, 'utc: ', utc_time_only)
    #forward new data to clients
    socketio.emit('session_response', payload, callback=message_received)
    return

#send message history to client
@socketio.on('load_previous')
def initial_message_load(data):
    '''
    Takes message history data, sends it to the client
    '''
    socketio.emit('load_previous', data) #broadcast=True

def generate_message_id(user_id):
    '''
    Takes user's ID, creates and returns a message id
    '''
    generated_msg_id = str(user_id[:4]) + str(generate_random_string(16))
    return generated_msg_id

def generate_random_string(length):
    '''
    Takes length value, returns a random generatetd string
    '''
    characters = string.digits
    return ''.join(random.choices(characters, k=length))

def new_message(database_location, table_name, dbpayload):
    '''
    Takes dblocation, table, and payload, saves entries (messages) into db.
    '''
    userid = dbpayload[0]
    msgid = generate_message_id(userid)
    dbpayload.append(str(msgid))
    try:
        conn = sqlite3.connect(database_location)
        sql = (f''' INSERT INTO {table_name}(userid, username, date, time, textmessage, profilepicurl, msgid)
                  VALUES(?,?,?,?,?,?,?) ''')
        cur = conn.cursor()
        cur.execute(sql, dbpayload)
        conn.commit()
        #print(cur.lastrowid, ' total saved msgs in db.')
        check_db_for_cleanup()
    except Exception as e: 
        print(e)
    return cur.lastrowid   


def load_messages(database_location, table_name, load_x_rows):
    '''
    Loads last x_rows (messages) from the database.
    '''
    try:
        conn = sqlite3.connect(database_location)
        cur = conn.cursor()
        rows = cur.execute(f"SELECT * FROM {table_name} ORDER BY ROWID DESC LIMIT {load_x_rows}"
        ).fetchall()
        i = 0
        previous_messages = []
        try:
            while i < load_x_rows:
                old_msg = rows[i]
                previous_messages.append(old_msg)
                i += 1
        except Exception as e:
            print('counting messages err, maybe less than client history option set')
    except Exception as e: 
        print(e,'loading msgs err')
    return previous_messages 

def check_db_for_cleanup():
    '''Checks against total messages limit, and calls for cleanup of db'''
    global cleanup_counter
    cleanup_counter += 1
    try:
        if cleanup_counter == total_msg_before_cleanup:
            total_rows = get_total_rows(message_db_location, 'messagedata')
            print(total_rows)
            if total_rows > (total_history_keep + 50):
                delete_oldest_rows(message_db_location, 'messagedata', 50)
        if cleanup_counter > total_msg_before_cleanup:
            cleanup_counter = 0
    except Exception as e:
        print(e)
    return

#delete oldest X rows, clean up db
def delete_oldest_rows(database_location, table_name, row_limit):
    try:
        conn = sqlite3.connect(database_location)
        cur = conn.cursor()
        # uses the built-in rowid
        cur.execute(f"""
            DELETE FROM {table_name}
            WHERE rowid IN (
                SELECT rowid FROM {table_name}
                ORDER BY rowid ASC
                LIMIT {row_limit})
        """)
        conn.commit()
        print(f"Deleted {cur.rowcount} rows from {table_name}")
    except sqlite3.Error as e:
        print(f"Error accessing database: {e}")
    finally:
        if conn:
            conn.close()


def get_total_rows(database_location, table_name):
    '''
    Takes db location, table, and returns total rows
    '''
    try:
        conn = sqlite3.connect(database_location)
        cur = conn.cursor()
        cur.execute(f"SELECT COUNT(*) FROM {table_name}"
        )
        total_rows = cur.fetchone()[0]
        return total_rows
    
    except sqlite3.Error as e:
        print(f"error accessing database: {e}")
        return None
    finally:
        if conn:
            conn.close()



if __name__ == '__main__':
    #flask on its own is allegedly not great for production 
    #not advisable to host this directly, use something like nginx to proxy
    socketio.run(app, host="0.0.0.0", port=app_port)