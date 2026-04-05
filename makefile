MAKE_RECURSIVE_DIRS := paper frontend# aws # make -C frontend generate が widget用のデモも作成するのでこの順番
export MAKE_RECURSIVE = time printf '%s\n' $(MAKE_RECURSIVE_DIRS) | xargs -IX sh -c '$(MAKE) -C X $@ || exit 255'
generate:
	bash -c "$${MAKE_RECURSIVE}"
run:
	bash -c "$${MAKE_RECURSIVE}"
deploy:
	bash -c "$${MAKE_RECURSIVE}"
