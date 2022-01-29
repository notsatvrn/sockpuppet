# Imports
import asyncio
import websockets
import os

# Variables
port = 3000
host = "0.0.0.0"
clients = []
clients_acc = []

# Handle Connections
async def handle_connections(websocket):
  try:
    data = await websocket.recv()
  except websockets.exceptions.ConnectionClosedOK:
    if websocket in clients:
      clients.remove(websocket)
    print("connection closed")
  except websockets.exceptions.ConnectionClosedError:
    if websocket in clients:
      clients.remove(websocket)
    print("connection closed")
  if data == "conn_new":
    await websocket.send("conn_accept")
    clients.append(websocket)
    clients_acc.append("")
    print("new connection")
  while websocket in clients:
    try:
      await websocket.ping()
      data = await websocket.recv()
      if data != "":
        if data == "ping":
          await websocket.send("pong")
        elif data[0:7] == "acc_reg":
          if not os.path.isdir("users"):
            os.mkdir("users")
          os.chdir("users")
          acc_data = data.replace("acc_reg ", "").split(" ")
          username = acc_data[0]
          password = acc_data[1]
          password_confirm = acc_data[2]
          if password != password_confirm:
            await websocket.send("pass_not_equal")
          if os.path.exists(f"{username}.txt"):
            await websocket.send("acc_exists")
          else:
            user_file_contents = [f"{password}"]
            with open(f"{username}.txt", "x") as user_file:
              user_file.write(user_file_contents)
              print(f"new user '{username}' registered")
        elif data[0:9] == "acc_login":
          if not os.path.isdir("users"):
            websocket.send("acc_not_exist")
            continue
          os.chdir("users")
          acc_data = data.replace("acc_login ", "").split(" ")
          username = acc_data[0]
          password = acc_data[1]
          if not os.path.exists(f"{username}.txt"):
            await websocket.send("acc_not_exist")
          else:
            with open(f"{username}.txt", "x") as user_file:
              user_file_contents = user_file.readlines()
              if user_file_contents[0] != password:
                await websocket.send("acc_wrong_pass")
              else:
                user_file_contents.remove(password)
                await websocket.send(user_file_contents)
                clients_acc[clients.index(websocket)] = username
                print(f"user '{username}' logged in")
        elif data == "conn_close":
          await websocket.wait_closed()
          clients.remove(websocket)
          print("connection closed")
    except websockets.exceptions.ConnectionClosedOK:
      if websocket in clients:
        clients.remove(websocket)
      print("connection closed")
    except websockets.exceptions.ConnectionClosedError:
      if websocket in clients:
        clients.remove(websocket)
      print("connection closed")
    finally:
      pass

async def main():
  async with websockets.serve(handle_connections, host, port):
    await asyncio.Future()

if __name__ == "__main__":
  print(f"vapor is now running at wss://{host}:{port}/")
  asyncio.run(main())