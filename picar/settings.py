from subprocess import check_output
HOST_NAME = check_output(['hostname', '--all-ip-addresses']).decode().rstrip()